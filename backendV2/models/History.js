const mongoose = require("mongoose");

const HistorySchema = new mongoose.Schema(
  {
    heading: {
      type: String,
      required: [true, "Heading is required"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    targetBefore: {
      type: Object,
      default: null,
    },
    target: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Target is required"],
      refPath: "targetModel",
    },
    targetModel: {
      type: String,
      required: [true, "Target model is required"],
      enum: [
        "request",
        "user",
        "institute",
        "task",
        "project",
        "level",
        "division",
        "department",
      ],
    },
    variant: {
      type: String,
      enum: ["action", "comment", "create", "update", "delete"],
      default: "action",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: [true, "User is required"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("history", HistorySchema);
