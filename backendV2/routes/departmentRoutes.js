const express = require("express");
const router = express.Router();
const departmentController = require("../controllers/departmentController");
const {
  requireSignIn,
  isAdminOrApprover,
  isAdmin,
  isAdminOrStaff,
} = require("../middlewares/auth");

// Get routes
router.get(
  "/all",
  requireSignIn,
  isAdminOrStaff,
  departmentController.getAllDepartments
);
router.get(
  "/by-division/:_id",
  requireSignIn,
  isAdminOrStaff,
  departmentController.getDepartmentsByDivision
);

// Post routes
router.post("/create", requireSignIn, departmentController.createDepartment);

// delete routes
router.delete(
  "/:_id",
  requireSignIn,
  isAdmin,
  departmentController.deleteDepartmentById
);

// Put routes
router.put(
  "/:_id",
  requireSignIn,
  isAdmin,
  departmentController.updateDepartmentById
);
module.exports = router;
