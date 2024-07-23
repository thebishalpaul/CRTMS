const mongoose = require("mongoose");
const { default: slugify } = require("slugify");

const RequestSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique:true
    },
    slug: {
      type: String,
      required: true,
      default: function () {
        return slugify(this?.title?.toLowerCase());
      },
    },
    description: {
      type: String,
      required: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    attachments: [
      {
        name: String,
      },
    ],
    status: {
      type: String,
      enum: [
        "awaiting-approval",
        "approved",
        "rejected",
        "in-progress",
        "completed",
        "complete-requested",
      ],
      default: "awaiting-approval",
    },
    requestType: {
      type: String,
      enum: ["change", "ticket"],
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "project",
      required: true,
    },
    institute: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "institute",
      required: true,
    },
    completedAt:{
      type:Date,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("request", RequestSchema);
