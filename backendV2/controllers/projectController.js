const { default: slugify } = require("slugify");
const Department = require("../models/Department");
const User = require("../models/User");
const Level = require("../models/Level");
const Division = require("../models/Division");
const Project = require("../models/Project");
const mongoose = require("mongoose");

exports.createProject = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(req.user._id).session(session);
    const { projectName: project_name, department, description } = req.body;

    if (!project_name || !department || !description) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingProject = await Project.findOne({
      slug: slugify(project_name.toLowerCase()),
      institute: user.institute,
      department,
    }).session(session);

    if (existingProject) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Same project already exists" });
    }

    const [project] = await Project.create(
      [
        {
          institute: user.institute,
          project_name,
          department,
          description,
          slug: slugify(project_name.toLowerCase()),
        },
      ],
      { session }
    );

    const departmentDoc = await Department.findById(department).session(
      session
    );
    if (!departmentDoc) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Department not found" });
    }

    // Update department manager
    if (departmentDoc.managed_by) {
      await User.findByIdAndUpdate(
        departmentDoc.managed_by,
        { $addToSet: { projects: project._id } },
        { session }
      );
    }

    // Update division manager
    const divisionDoc = await Division.findById(departmentDoc.division).session(
      session
    );
    if (divisionDoc && divisionDoc.managed_by) {
      await User.findByIdAndUpdate(
        divisionDoc.managed_by,
        { $addToSet: { projects: project._id } },
        { session }
      );
    }

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      project,
      message: "Project created successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.deleteProjectById = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { _id } = req.params;

    if (!_id) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Project ID is required" });
    }

    const user = await User.findById(req.user._id).session(session);
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "User not found" });
    }

    const project = await Project.findByIdAndDelete(_id).session(session);
    if (!project) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Project not found" });
    }

    await User.updateMany(
      { projects: { $in: [_id] } },
      { $pull: { projects: _id } },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      project,
      message: "Deleted successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateProjectById = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { _id } = req.params;
    const user = await User.findById(req.user._id).session(session);
    const { projectName: project_name, department, description } = req.body;

    if (!_id) {
      throw new Error("Project ID is required");
    }

    if (!project_name || !department) {
      throw new Error("Project name and department are required");
    }

    const existingProject = await Project.findOne({
      slug: slugify(project_name.toLowerCase()),
      _id: { $ne: _id },
      institute: user.institute,
    }).session(session);

    if (existingProject) {
      throw new Error("Same project already exists");
    }

    const oldProject = await Project.findById(_id)
      .populate({
        path: "department",
        populate: {
          path: "division",
        },
      })
      .session(session);

    if (!oldProject) {
      throw new Error("Project not found");
    }

    const updatedProject = await Project.findByIdAndUpdate(
      _id,
      {
        project_name,
        department,
        description,
        slug: slugify(project_name.toLowerCase()),
      },
      { new: true, session }
    )
      .populate({
        path: "department",
        populate: {
          path: "division",
        },
      })
      .session(session);

    // If Department changed
    if (!oldProject.department._id.equals(updatedProject.department._id)) {
      // Remove the project from all the users having department
      await User.updateMany(
        {
          departments: { $in: [oldProject.department._id] },
          projects: { $in: [_id] },
        },
        { $pull: { projects: _id } },
        { session }
      );

      // Add the project to the managerb of the department
      await User.findByIdAndUpdate(
        updatedProject.department.managed_by,
        { $addToSet: { projects: _id } },
        { session }
      );
    }

    // If Division changed
    if (
      !oldProject.department.division._id.equals(
        updatedProject.department.division._id
      )
    ) {
      await User.findByIdAndUpdate(
        updatedProject.department.division.managed_by,
        { $addToSet: { projects: _id } },
        { session }
      );
    }

    await session.commitTransaction();

    return res.status(200).json({
      success: true,
      project: updatedProject,
      message: "Updated successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    console.error(error);
    return res
      .status(500)
      .json({ message: error.message || "Internal server error" });
  } finally {
    session.endSession();
  }
};

exports.getAllProjects = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const query = {
      institute: user.institute,
    };
    if (user.role == "manager-staff") {
      query._id = {
        $in: user.projects,
      };
    }
    const projects = await Project.find(query)
      .populate({
        path: "managed_by",
        model: User,
      })
      .populate({
        path: "department",
        model: Department,
        populate: {
          path: "division",
          model: Division,
        },
      });
    return res.status(200).json({ success: true, projects });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getProjectByDepartment = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const query = {
      department: req.params._id,
    };

    if (user.role == "manager-staff") {
      query._id = {
        $in: user.projects,
      };
    }

    const projects = await Project.find(query).populate({
      path: "department",
      model: Department,
    });
    return res.status(200).json({ success: true, projects });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getProjectByDepartments = async (req, res) => {
  try {
    const departmentIds = req?.query?.departmentIds?.split(",");
    console.log(departmentIds);
    const user = await User.findById(req.user._id).populate("institute");
    const assignedLevels = user.institute.configuration.assigned_levels;
    const level = req.query.level;

    const query = {
      institute: user.institute._id,
      department: { $in: departmentIds },
    };

    if (assignedLevels.project._id.equals(level)) {
      query.managed_by = null;
    }

    if (user.role == "manager-staff") {
      query._id = {
        $in: user.projects,
      };
    }
    console.log(query);

    const projects = await Project.find(query).populate({
      path: "department",
      model: Department,
    });
    console.log(projects);
    return res.status(200).json({ success: true, projects });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
