const { default: slugify } = require("slugify");
const Division = require("../models/Division");
const User = require("../models/User");
const Level = require("../models/Level");
const { default: mongoose } = require("mongoose");

exports.createDivision = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { divisionName: division_name } = req.body;
    if (!division_name) {
      return res.status(500).json({ message: "All fields are required" });
    }
    const existingDivision = await Division.findOne({
      slug: slugify(division_name?.toLowerCase()),
      institute: user.institute,
    });
    if (existingDivision)
      return res.status(500).json({ message: "Same division already exists" });

    const division = await Division.create({
      institute: user.institute,
      division_name,
    });
    return res.status(200).json({
      success: true,
      division,
      message: "Division created successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.deleteDivisionById = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const { _id } = req.params;

    if (!_id) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Division ID is required" });
    }

    const user = await User.findById(req.user._id).session(session);
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "User not found" });
    }

    const division = await Division.findById(_id).session(session);
    if (!division) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Division not found" });
    }

    await Division.deleteOne({ _id }, { session });

    // Update the user whose division was that
    await User.findByIdAndUpdate(
      division.managed_by,
      { division: null },
      { session }
    );

    await session.commitTransaction();
    session.endSession();
    return res
      .status(200)
      .json({ success: true, division, message: "Deleted successfully" });
  } catch (error) {
    try {
      await session.abortTransaction();
    } catch (abortError) {
      console.error("Transaction abort error: ", abortError);
    }
    session.endSession();
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getAllDivisions = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("institute");
    const assignedLevels = user.institute.configuration.assigned_levels;

    const query = { institute: user.institute._id };
    const level = req.query.level;
    if (assignedLevels?.division?._id.equals(level)) {
      query.managed_by = null;
    }

    if (user.role == "manager-staff") {
      query._id = user.division;
    }

    const divisions = await Division.find(query).populate({
      path: "managed_by",
      model: User,
    });
    return res.status(200).json({ success: true, divisions });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};