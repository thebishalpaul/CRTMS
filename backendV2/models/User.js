const mongoose = require("mongoose");
const roles = require("../helpers/role");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "User",
    },
    profile_picture: {
      type: String,
      default: "http://localhost:8000/uploads/users/user.png",
      // If set to null, use the default value
      set: function (value) {
        if (!value) {
          return "http://localhost:8000/uploads/users/user.png";
        }
        return value;
      },
    },
    email: {
      type: String,
      match: /^\S+@\S+\.\S+$/,
      required: true,
      unique: true,
    },
    phoneno: {
      type: String,
      match: /^[0-9]{10}$/,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: roles,
    },
    institute: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "institute",
    },
    division: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "division",
    },
    departments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "department",
      },
    ],
    projects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "project",
      },
    ],
    level: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "level",
    },
    status: {
      type: String,
      required: true,
      enum: ["active", "inactive", "verified", "not_verified"],
      default: "verified",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("user", UserSchema);
