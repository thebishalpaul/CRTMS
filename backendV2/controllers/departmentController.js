const { default: slugify } = require("slugify");
const Department = require("../models/Department");
const User = require("../models/User");
const Level = require("../models/Level");
const Division = require("../models/Division");
const Project = require("../models/Project");
const { default: mongoose } = require("mongoose");
const Institute = require("../models/Institute");
const { hashPassword } = require("../helpers/auth");

exports.createDepartment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(req.user._id);
    const { departmentName, division, email } = req.body;

    if (!departmentName || !division) {
      throw new Error("Department name and division are required");
    }
    if (!email) {
      throw new Error("Email is required");
    }

    // Chech for existing department
    const existingDepartment = await Department.findOne({
      slug: slugify(departmentName.toLowerCase()),
      institute: user.institute,
      division,
    });

    if (existingDepartment) {
      throw new Error(
        "A department with the same name under same division already exists"
      );
    }

    // Create a new department
    const department = await Department.create(
      [
        {
          institute: user.institute,
          department_name: departmentName,
          division,
        },
      ],
      { session }
    );

    // Add the department to the manager of the division
    const managerDivision = await Division.findById(division).session(session);

    if (!managerDivision) {
      throw new Error("Division not found");
    }

    await User.findByIdAndUpdate(
      managerDivision.managed_by,
      {
        $push: { departments: department[0]._id },
      },
      { session }
    );

    // Create an institute (requester) correspond to that department

    // Create an approver for the outsider institute
    institute_name = department[0]?.department_name?.toUpperCase();
    const defaultName = "Requester Admin";
    const defaultPassword = "1234";

    const requesterAdmin = await User.create(
      [
        {
          name: defaultName,
          email,
          password: await hashPassword(defaultPassword),
          role: "requester-admin",
          departments: [department[0]._id],
          status: "active",
        },
      ],
      { session }
    );

    // Create the associated institute
    const institute = await Institute.create(
      [
        {
          institute_name,
          slug: slugify(institute_name),
          institute_type: "requester",
          admin: requesterAdmin[0]._id,
          manager_institute: user.institute,
          manager_division: department[0].division._id,
          manager_department: department[0]._id,
        },
      ],
      { session }
    );

    // Update the user with the associated institute
    requesterAdmin[0].institute = institute[0]._id;
    await requesterAdmin[0].save({ session });

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      success: true,
      department: department[0],
      message: "Department and the outsider admin created successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error(error);
    return res.status(500).json({
      message:
        error.message || "An error occurred while creating the department",
    });
  }
};

exports.deleteDepartmentById = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { _id } = req.params;

    if (!_id) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ success: false, message: "Department ID is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(_id)) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ success: false, message: "Invalid Department ID" });
    }

    const user = await User.findById(req.user._id).session(session);
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const department = await Department.findById(_id)
      .populate({
        path: "requesterInstitute",
        model: Institute,
      })
      .session(session);
    if (!department) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ success: false, message: "Department not found" });
    }

    // Delete the department
    await Department.deleteOne({ _id }).session(session);

    // Delete the associated institute
    await Institute.findByIdAndDelete(
      department?.requesterInstitute?._id
    ).session(session);

    // Delete the admin of the institute
    await User.findByIdAndDelete(department?.requesterInstitute?.admin).session(
      session
    );

    const deletedProjects = await Project.deleteMany(
      { department: department._id },
      { session }
    );

    // Update related users by removing the deleted department and projects
    const usersToUpdate = await User.find({
      institute: user.institute,
      division: department.division,
      departments: { $in: [department._id] },
    }).session(session);

    await User.updateMany(
      { _id: { $in: usersToUpdate.map((user) => user._id) } },
      { $pull: { departments: department._id } },
      { session }
    );

    if (deletedProjects.deletedCount > 0) {
      const projectIds = deletedProjects?.result?.map((project) => project._id);
      await User.updateMany(
        { _id: { $in: usersToUpdate.map((user) => user._id) } },
        {
          $pull: {
            projects: { $in: projectIds },
          },
        },
        { session }
      );
    }

    await session.commitTransaction();
    session.endSession();

    return res
      .status(200)
      .json({ success: true, message: "Department deleted successfully" });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

exports.updateDepartmentById = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { _id } = req.params;
    const { departmentName: department_name, division } = req.body;

    if (!_id) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Department ID is required" });
    }

    if (!department_name) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findById(req.user._id).session(session);
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "User not found" });
    }

    const department = await Department.findById(_id).session(session);
    if (!department) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Department not found" });
    }

    const existingDepartment = await Department.findOne({
      slug: slugify(department_name.toLowerCase()),
      _id: { $ne: _id },
      institute: user.institute,
    }).session(session);

    if (existingDepartment) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ message: "Same department already exists" });
    }

    if (!department.division.equals(division)) {
      // The division is changing, update related users and projects
      const usersToUpdate = await User.find({
        institute: user.institute,
        division: department.division,
        departments: { $in: [department._id] },
      }).session(session);

      const deletedProjects = await Project.find({
        department: department._id,
      }).session(session);

      await User.updateMany(
        { _id: { $in: usersToUpdate.map((user) => user._id) } },
        { $pull: { departments: department._id } },
        { session }
      );

      if (deletedProjects.length > 0) {
        const projectIds = deletedProjects.map((project) => project._id);
        await User.updateMany(
          { _id: { $in: usersToUpdate.map((user) => user._id) } },
          { $pull: { projects: { $in: projectIds } } },
          { session }
        );
      }

      // Add the department to the new division manager
      const newDivision = await Division.findById(division).session(session);
      if (newDivision && newDivision.managed_by) {
        await User.findByIdAndUpdate(
          newDivision.managed_by,
          {
            $addToSet: {
              departments: department._id,
              projects: {
                $each: deletedProjects.map((project) => project._id),
              },
            },
          },
          { session }
        );
      }
      department.managed_by = null;
    }

    // Update the department details
    department.department_name = department_name;
    department.division = division;
    department.slug = slugify(department_name.toLowerCase());
    await department.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res
      .status(200)
      .json({ success: true, department, message: "Updated successfully" });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getAllDepartments = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const query = {
      institute: user.institute,
    };
    if (user.role == "manager-staff") {
      query._id = {
        $in: user.departments,
      };
    }

    const departments = await Department.find(query)
      .populate({
        path: "division",
        model: Division,
      })
      .populate({ path: "managed_by", model: User })
      .populate({
        path: "requesterInstitute",
        model: Institute,
        populate: {
          path: "admin",
          model: User,
        },
      });
    return res.status(200).json({ success: true, departments });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getDepartmentsByDivision = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("institute");
    const assignedLevels = user.institute.configuration.assigned_levels;
    const level = req.query.level;
    const prevDivision = await Division.findById(req.params._id);
    if (prevDivision.managed_by && assignedLevels.division._id.equals(level)) {
      return res.status(200).json({ success: false });
    }

    const query = {
      institute: user.institute,
      division: req.params._id,
    };

    if (assignedLevels.department._id.equals(level)) {
      query.managed_by = null;
    }
    console.log(user.departments);
    if (user.role == "manager-staff") {
      query._id = {
        $in: user.departments,
      };
    }

    const departments = await Department.find(query).populate({
      path: "division",
      model: Division,
    });

    const projects = await Project.find({
      institute: user.institute,
      department: {
        $in: departments.map((department) => department._id),
      },
    })
      .populate("department");

    return res.status(200).json({ success: true, departments, projects });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
