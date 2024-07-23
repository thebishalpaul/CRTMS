const mongoose = require("mongoose");
const { default: slugify } = require("slugify");

const InstituteSchema = new mongoose.Schema(
  {
    institute_name: {
      type: String,
      required: true,
      unique: true,
    },
    address: {
      type: String,
    },
    contact_info: {
      type: String,
    },
    institute_type: {
      type: String,
      enum: ["requester", "manager"],
      default: "requester",
    },
    slug: {
      type: String,
      required: true,
      default: function () {
        return slugify(this.institute_name.toLowerCase());
      },
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    manager_institute: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "institute",
      default: null,
    },
    manager_division: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "division",
      default: null,
    },
    manager_department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "institute",
      default: null,
    },
    configuration: {
      assigned_levels: {
        division: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "level",
          default: null,
        },
        department: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "level",
          default: null,
        },
        project: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "level",
          default: null,
        },
      },
    },
    status: {
      type: String,
      required: true,
      enum: ["active", "inactive", "verified", "not_verified"],
      default: "not_verified",
    },
    request_flow: {
      change_request: {
        type: Boolean,
        default: true,
      },
      ticket_request: {
        type: Boolean,
        default: false,
      }
    }
  },

  { timestamps: true }
);

module.exports = mongoose.model("institute", InstituteSchema);
