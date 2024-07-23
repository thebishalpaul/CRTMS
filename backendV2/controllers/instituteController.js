// controllers/instituteInstituteController.js
const Institute = require("../models/Institute");
const slugify = require("slugify");
const Division = require("../models/Division");
const roles = require("../helpers/role");
const { hashPassword } = require("../helpers/auth");
const User = require("../models/User");
const mongoose = require("mongoose");



// get manager institutes
exports.getManagerInstitutes = async (req, res) => {
  try {
    const instituteType = "manager";
    const institutes = await Institute.find({
      institute_type: instituteType,
    }).populate({
      path: "admin",
      model: User,
    });
    console.log(institutes);
    return res.status(200).json({ success: true, institutes });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

exports.getRequesterInstitutes = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const instituteType = "requester";
    const query = {
      manager_institute: user.institute,
      institute_type: instituteType,
    };
    if (user.role == "manager-admin") {
      query.manager_institute = user.institute;
    }

    if (user.role == "manager-staff") {
      query.manager_department = {
        $in: user.departments,
      };
    }
    const institutes = await Institute.find(query).populate({
      path: "admin",
      model: User,
    });
    console.log(institutes);
    return res.status(200).json({ success: true, institutes });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

// Create a new Institute
exports.createManagerInstitute = async (req, res) => {
  let { instituteName: institute_name, email } = req.body;
  console.log(email);
  const defaultName = "Admin";
  const defaultPassword = "1234";

  const slug = slugify(institute_name.toLowerCase());
  const slug2 = slugify(email.toLowerCase());

  // Start a transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const existingInstitute = await Institute.findOne({ slug }).session(session);
    if (existingInstitute) {
      throw new Error("An institute with this name already exists.");
    }

    const existingUser = await User.findOne({ email: slug2 }).session(session);
    if (existingUser) {
      throw new Error("An user with this email already exists.");
    }

    const user = await User.create(
      [
        {
          name: defaultName,
          email,
          password: await hashPassword(defaultPassword),
          role: "manager-admin",
          status: "active",
        },
      ],
      { session }
    );

    const institute = await Institute.create(
      [
        {
          institute_name,
          institute_type: "manager",
          admin: user[0]._id,
        },
      ],
      { session }
    );

    user[0].institute = institute[0]._id;
    await user[0].save({ session });

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: "Institute created successfully.",
    });
  } catch (error) {
    // Rollback the transaction on error
    await session.abortTransaction();
    session.endSession();

    console.log(error);
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.createRequesterInstitute = async (req, res) => {
  let { department, email } = req.body;
  const managerAdmin = await User.findById(req.user._id);
  institute_name = department?.department_name?.toUpperCase();
  const defaultName = "Requester Admin";
  const defaultPassword = "1234";

  // Start a transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Create the manager user
    const user = await User.create(
      [
        {
          name: defaultName,
          email,
          password: await hashPassword(defaultPassword),
          role: "requester-admin",
          departments: [department._id],
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
          admin: user[0]._id,
          manager_institute: managerAdmin.institute,
          manager_division: department.division._id,
          manager_department: department._id,
        },
      ],
      { session }
    );

    // Update the user with the associated institute
    user[0].institute = institute[0]._id;
    await user[0].save({ session });

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: "institute created successfully.",
    });
  } catch (error) {
    // Rollback the transaction on error
    await session.abortTransaction();
    session.endSession();

    console.log(error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// Configuration
exports.getConfiguration = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: "institute",
      model: Institute,
    });
    const institute = await Institute.findById(user?.institute?._id)
      .populate({
        path: "configuration.assigned_levels.division",
        model: "level",
      })
      .populate({
        path: "configuration.assigned_levels.department",
        model: "level",
      })
      .populate({
        path: "configuration.assigned_levels.project",
        model: "level",
      });
    console.log(institute);
    return res
      .status(200)
      .json({ success: true, configuration: institute?.configuration, user });
  } catch (error) {
    console.log(error);
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getRequestFlow = async (req, res) => {
  try {
    const { _id } = req.user;

    const user = await User.findById(_id).populate("institute", "request_flow");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const institute = user.institute;
    if (!institute) {
      return res
        .status(404)
        .json({ success: false, message: "Institute not found" });
    }

    const access = institute.request_flow;
    return res.status(200).json({ success: true, access });
  } catch (error) {
    console.error("Error fetching request flow:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.updateConfiguration = async (req, res) => {
  try {
    const { _key, value } = req.body;
    const institute = await Institute.findOne({
      admin: req?.user?._id,
    });
    institute.configuration.assigned_levels[_key] = value;
    await institute.save();
    return res
      .status(200)
      .json({ success: true, message: "Updated successfully" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateRequestFlow = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log(userId);
    const { change_request, ticket_request } = req.body.request_flow;
    console.log("Update request flow: ");
    console.log(req.body.request_flow);
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const institute = await Institute.findById(user.institute);
    if (!institute) {
      return res.status(404).json({ message: "Institute not found" });
    }

    // Update only provided fields
    if (typeof change_request === "boolean") {
      institute.request_flow.change_request = change_request;
    }
    if (typeof ticket_request === "boolean") {
      institute.request_flow.ticket_request = ticket_request;
    }

    await institute.save();

    return res
      .status(200)
      .json({ success: true, message: "Request flow updated successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
