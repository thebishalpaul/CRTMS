const History = require("../models/History");
const User = require("../models/User");

exports.createHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { heading, description, targetModel, target, variant } = req.body;

    const history = await History.create({
      heading,
      description,
      targetModel,
      target,
      variant,
      user: user._id,
    });
    res.status(200).json({
      success: true,
      message: "History created successfully",
      history,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      message: error.message || "Internal server error",
    });
  }
};

exports.getAllHistories = async (req, res) => {
  try {
    const query = req.query;
    const histories = await History.find(query)
      .populate("user")
      .populate("target")
      .sort({ updatedAt: -1 });
    res.status(200).json({ success: true, histories });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};