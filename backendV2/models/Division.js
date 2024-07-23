const mongoose = require("mongoose");
const { default: slugify } = require("slugify");

const divisionSchema = new mongoose.Schema(
  {
    division_name: {
      type: String,
      required: true,
    },
    institute: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "institute",
      required: true,
    },
    managed_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      default: null,
    },
    slug: {
      type: String,
      required: true,
      default: function () {
        return slugify(this?.division_name?.toLowerCase());
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("division", divisionSchema);
