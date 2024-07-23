const { default: slugify } = require("slugify");
const Level = require("../models/Level");
const User = require("../models/User");

exports.createLevel = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { levelName: level_name } = req.body;
    const levels = await Level.find({ institute: user?.institute });
    if (!level_name) {
      return res.status(500).json({ message: "All fields are required" });
    }
    const existingLevel = await Level.findOne({
      slug: slugify(level_name?.toLowerCase()),
      institute: user?.institute,
    });
    if (existingLevel)
      return res.status(500).json({ message: "Same level already exists" });

    const level = await Level.create({
      institute: user.institute,
      level_name,
      priority: levels.length + 1,
    });
    return res
      .status(200)
      .json({ success: true, level, message: "Level created successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.deleteLevelById = async (req, res) => {
  try {
    const { _id } = req.params;

    if (!_id) {
      return res.status(400).json({ message: "Level ID is required" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const level = await Level.findByIdAndDelete(_id);
    if (!level) {
      return res.status(404).json({ message: "Level not found" });
    }

    const levelsToUpdate = await Level.find({ institute: user.institute });

    const bulkUpdateOps = levelsToUpdate.map((level, index) => ({
      updateOne: {
        filter: { _id: level._id },
        update: { $set: { priority: index + 1 } },
      },
    }));
    await Level.bulkWrite(bulkUpdateOps);

    return res
      .status(200)
      .json({ success: true, level, message: "Deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateLevelById = async (req, res) => {
  try {
    const { _id } = req.params;

    if (!_id) {
      return res.status(400).json({ message: "Level ID is required" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const level = await Level.findByIdAndUpdate(_id, req.body);
    if (!level) {
      return res.status(404).json({ message: "Level not found" });
    }

    const levelsToUpdate = await Level.find({ institute: user.institute });
    const bulkUpdateOps = levelsToUpdate.map((level, index) => ({
      updateOne: {
        filter: { _id: level._id },
        update: { $set: { priority: index + 1 } },
      },
    }));
    await Level.bulkWrite(bulkUpdateOps);

    return res
      .status(200)
      .json({ success: true, level, message: "Level Updated Successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.changeConfiguration = async (req, res) => {
  try {
    const { _id } = req.params;

    if (!_id) {
      return res.status(400).json({ message: "Level ID is required" });
    }

    const user = await User.findById(req.user._id).populate("level");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user?.level?.access?.edit_configuration) {
      return res.status(404).json({ message: "Access Denied" });
    }

    const level = await Level.findByIdAndUpdate(_id, req.body);
    if (!level) {
      return res.status(404).json({ message: "Level not found" });
    }

    const levelsToUpdate = await Level.find({ institute: user.institute });
    const bulkUpdateOps = levelsToUpdate.map((level, index) => ({
      updateOne: {
        filter: { _id: level._id },
        update: { $set: { priority: index + 1 } },
      },
    }));
    await Level.bulkWrite(bulkUpdateOps);

    return res
      .status(200)
      .json({ success: true, level, message: "Level Updated Successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getAllLevels = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("level");

    const query = { institute: user.institute };

    if (user.role == "manager-staff") {
      query.priority = { $gt: user?.level?.priority };
    }
    console.log(query);
    const levels = await Level.find(query);
    return res.status(200).json({ success: true, levels });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
