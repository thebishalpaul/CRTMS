const { default: slugify } = require("slugify");
const Department = require("../models/Department");
const User = require("../models/User");
const Level = require("../models/Level");
const Division = require("../models/Division");
const Project = require("../models/Project");
const Institute = require("../models/Institute");
const { hashPassword, comparePassword } = require("../helpers/auth");
const { default: mongoose } = require("mongoose");
const notificationService = require("../services/notificationService");

exports.createUser = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(req.user._id).populate("institute");
    const assignedLevels = user.institute.configuration.assigned_levels;
    const email = req.body.email;
    const division = req.body.division._id;
    const level = req.body.level;
    const departments = req.body.departments?.map(
      (department) => department._id
    );
    const projects = req.body.projects?.map((project) => project._id);
    const password = "1234";

    if (
      !email ||
      !division ||
      !departments ||
      !projects ||
      !password ||
      !level
    ) {
      return res.status(500).json({ message: "All Fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(500).json({ message: "User already exists" });
    }

    const [newUser] = await User.create(
      [
        {
          institute: user.institute._id,
          email,
          division,
          departments,
          projects,
          password: await hashPassword(password),
          level,
          role: "manager-staff",
        },
      ],
      { session: session }
    );

    if (!newUser)
      return res
        .status(500)
        .json({ message: "Error occured while creating the user" });

    if (assignedLevels.division?._id.equals(level)) {
      await Division.findByIdAndUpdate(
        division,
        { managed_by: newUser._id },
        { session }
      );
    } else if (assignedLevels.department?._id.equals(level)) {
      await Department.updateMany(
        { _id: { $in: departments } },
        { managed_by: newUser._id },
        { session }
      );
    } else if (assignedLevels.project?._id.equals(level)) {
      await Project.updateMany(
        { _id: { $in: projects } },
        { managed_by: newUser._id },
        { session }
      );
    }

    await session.commitTransaction();
    session.endSession();

    return res
      .status(200)
      .json({ success: true, message: "User created successfully" });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Used by Requester Admin
exports.createRequesterStaff = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Extract email from the request body
    const email = req.body.email;

    const existingUser = await User.findOne({
      email,
      institute: user.institute,
    });

    if (existingUser) {
      return res.status(500).json({ message: "User already exists" });
    }

    // Create a new user with the specified values
    const newUser = new User({
      name: "Staff",
      role: "requester-staff",
      password: await hashPassword("1234"),
      institute: user.institute,
      email: email,
    });

    await newUser.save();

    return res.status(201).json({
      success: true,
      message: "Requester staff created successfully",
      data: newUser,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.createDeveloper = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Extract email from the request body
    const email = req.body.email;
    const project = req.body.project;

    if (!email || !project) {
      return res.status(404).json({ message: "All Fields are required" });
    }

    const existingUser = await User.findOne({
      email,
    });

    if (existingUser) {
      return res.status(500).json({ message: "Developer already exists" });
    }

    // Create a new user with the specified values
    const newUser = await User.create({
      name: "Developer",
      role: "developer",
      password: await hashPassword("1234"),
      projects: [project],
      institute: user.institute,
      email: email,
    });

    return res.status(201).json({
      success: true,
      message: "Developer created successfully",
      data: newUser,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getRequesterStaff = async (req, res) => {
  try {
    const requestingUser = await User.findById(req.user._id);

    if (!requestingUser) {
      return res.status(404).json({ message: "Requesting user not found" });
    }

    // Extract the role from the request query
    const role = req.query.role;
    if (!role) {
      return res.status(400).json({ message: "Role is required" });
    }

    // Query the database for users with the specified role and the same institute as the requesting user
    const users = await User.find({
      role: role,
      institute: requestingUser.institute,
    });

    // Respond with the found users
    return res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      users,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateUserById = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(req.params._id).populate("institute");
    const assignedLevels = user.institute.configuration.assigned_levels;
    const email = req.body.email;
    const division = req.body.division._id;
    const level = req.body.level;
    const departments = req.body.departments?.map(
      (department) => department._id
    );
    const projects = req.body.projects?.map((project) => project._id);

    if (!email || !division || !departments || !projects || !level) {
      return res.status(500).json({ message: "All Fields are required" });
    }

    const updatedUser = {
      email,
      division,
      departments,
      projects,
      level,
    };

    const updated = await User.updateOne({ _id: req.params._id }, updatedUser, {
      session: session,
    });
    if (!updated) {
      return res.status(500).json({
        message: "Error occurred while updating the user",
      });
    }

    if (assignedLevels.division?._id.equals(level)) {
      await Division.findByIdAndUpdate(
        division,
        { managed_by: req.params._id },
        { session }
      );
    } else if (assignedLevels.department?._id.equals(level)) {
      await Department.updateMany(
        { _id: { $in: departments } },
        { managed_by: req.params._id },
        { session }
      );
    } else if (assignedLevels.project?._id.equals(level)) {
      await Project.updateMany(
        { _id: { $in: projects } },
        { managed_by: req.params._id },
        { session }
      );
    }
    const updatedUserDoc = await User.findById(req.params._id)
      .populate('division')
      .populate('level')
      .session(session);
      
    await notificationService.createNotification({
      user: req.params._id,
      message: `Your Level is set to "${updatedUserDoc.level.level_name}" and division is changed to "${updatedUserDoc.division.division_name}".`,
    }, session);

    await session.commitTransaction();
    session.endSession();

    return res
      .status(200)
      .json({ success: true, message: "User updated successfully" });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateMyProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID not provided" });
    }

    if (req?.body?.password) {
      const hashedPassword = await hashPassword(req?.body?.password);
      req.body.password = hashedPassword;
    } else {
      delete req.body.password;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: req.body }, // Use $set to update specific fields only
      { new: true, runValidators: true }
    ).select("-password "); // Exclude sensitive fields from the response

    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    console.log(updatedUser);

    return res.status(200).json({
      success: true,
      user: updatedUser,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

exports.deleteUserById = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { _id } = req.params;

    if (!_id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    await Division.updateMany(
      { managed_by: _id },
      { managed_by: null },
      { session }
    );
    await Department.updateMany(
      { managed_by: _id },
      { managed_by: null },
      { session }
    );
    await Project.updateMany(
      { managed_by: _id },
      { managed_by: null },
      { session }
    );

    const user = await User.findByIdAndDelete(_id, { session });
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "User not found" });
    }

    await session.commitTransaction();
    session.endSession();

    return res
      .status(200)
      .json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    console.error(error);
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params._id)
      .populate("institute")
      .populate("level")
      .populate("division")
      .populate("departments")
      .populate("projects");

    console.log(user);

    return res.status(200).json({ success: true, users: user });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

exports.getAllUsers = async (req, res) => {
  console.log("406: " + req.user._id);
  try {
    const user = await User.findById(req.user._id).populate({
      path: "institute",
      populate: {
        path: "configuration.assigned_levels.division configuration.assigned_levels.department configuration.assigned_levels.project",
        model: Level,
      },
    });

    const assignedLevels = user.institute?.configuration?.assigned_levels;
    const query = {
      institute: user.institute._id,
    };

    // For manager department

    if (user.role === "manager-admin") {
      query.role = "manager-staff";
    }

    if (user.role === "manager-staff") {
      query.role = "manager-staff";
      if (
        assignedLevels.division &&
        assignedLevels.division.equals(user.level)
      ) {
        query.division = user.division;
      } else if (
        assignedLevels.department &&
        assignedLevels.department.equals(user.level)
      ) {
        query.departments = { $in: user.departments };
      } else {
        query.projects = { $in: user.projects };
      }
    }

    if (user.role === "requester-admin" || user.role === "requester-staff") {
      query.role = "requester-staff";
    }

    const users = await User.find(query)
      .populate("level")
      .populate("division")
      .populate("departments")
      .populate("projects");
    // console.log("USERRRR: ");
    // console.log(users);
    return res.status(200).json({ success: true, users });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params._id)
      .populate("institute")
      .populate("level")
      .populate("division")
      .populate("departments")
      .populate("projects");

    console.log(user);

    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

exports.getUserByToken = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("institute")
      .populate("level")
      .populate("division")
      .populate("departments")
      .populate("projects");

    console.log(user);

    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

exports.getMyAccess = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("level");

    const access = user?.level?.access;
    console.log(access);

    return res.status(200).json({ success: true, access });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getDevelopers = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const query = {
      role: "developer",
      institute: user.institute,
    };
    if (user.role === "manager-staff") {
      query.projects = {
        $in: user.projects,
      };
    }
    const developers = await User.find(query).populate("projects");
    return res.status(200).json({ success: true, developers });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

exports.uploadProfilePicture = async (req, res) => {
  try {
    const userId = req.user._id;
    const file = req.files[0];
    const profileImageUrl = `${req.protocol}://${req.get(
      "host"
    )}/uploads/users/${file.filename}`;

    console.log(profileImageUrl);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profile_picture: profileImageUrl },
      { new: true }
    );

    res.status(200).json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    res.status(500).json({
      success: false,
      message: "Error uploading profile picture",
    });
  }
};
