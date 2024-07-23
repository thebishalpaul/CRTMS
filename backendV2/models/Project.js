const mongoose = require("mongoose");
const { default: slugify } = require("slugify");

const projectSchema = new mongoose.Schema(
  {
    project_name: {
      type: String,
      required: true,
      unique: true
    },
    description: {
      type: String,
      required: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "department",
      required: true,
    },
    managed_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    institute: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "institute",
      required: true,
    },
    slug: {
      type: String,
      required: true,
      default: function () {
        return slugify(this?.project_name?.toLowerCase());
      },
    },
    progress: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["inprogress", "inhalt", "completed"],
      default: "inprogress",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("project", projectSchema);
