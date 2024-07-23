const mongoose = require("mongoose");
const { default: slugify } = require("slugify");

const levelSchema = new mongoose.Schema(
  {
    level_name: {
      type: String,
      required: true,
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
        return slugify(this?.level_name?.toLowerCase());
      },
    },
    priority: {
      type: Number,
      required: true,
    },
    access: {
      create_department: {
        type: Boolean,
        default: false,
      },
      create_institute: {
        type: Boolean,
        default: false,
      },
      manage_user: {
        type: Boolean,
        default: false,
      },
      manage_project: {
        type: Boolean,
        default: false,
      },
      manage_developers: {
        type: Boolean,
        default: false,
      },
      manage_access: {
        type: Boolean,
        default: false,
      },
      manage_change_request: {
        type: Boolean,
        default: false,
      },
      manage_ticket_request: {
        type: Boolean,
        default: false,
      },
      approve_response_to_change_request: {
        type: Boolean,
        default: false,
      },
      approve_response_to_ticket_request: {
        type: Boolean,
        default: false,
      },
      respond_to_change_request: {
        type: Boolean,
        default: false,
      },
      respond_to_ticket_request: {
        type: Boolean,
        default: false,
      },
      view_tasks: {
        type: Boolean,
        default: false,
      },
      manage_tasks: {
        type: Boolean,
        default: false,
      },
      edit_configuration: {
        type: Boolean,
        default: false,
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("level", levelSchema);
