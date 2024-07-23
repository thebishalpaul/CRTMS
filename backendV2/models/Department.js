const mongoose = require("mongoose");
const { default: slugify } = require("slugify");

const departmentSchema = new mongoose.Schema(
  {
    department_name: {
      type: String,
      required: true,
    },
    institute: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "institute",
      required: true,
    },
    division: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "division",
      default: null,
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
        return slugify(this?.department_name?.toLowerCase());
      },
    },
  },
  { timestamps: true }
);

// Add virtual field for requester institute
departmentSchema.virtual("requesterInstitute", {
  ref: "institute",
  localField: "_id",
  foreignField: "manager_department",
  justOne: true,
});

departmentSchema.set("toObject", { virtuals: true });
departmentSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("department", departmentSchema);
