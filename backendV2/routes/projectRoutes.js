const express = require("express");
const router = express.Router();
const projectController = require("../controllers/projectController");
const {
  requireSignIn,
  isAdminOrApprover,
  isAdmin,
  isAdminOrStaff,
} = require("../middlewares/auth");

// Get routes
router.get("/all", requireSignIn, projectController.getAllProjects);

router.get(
  "/by-department/:_id",
  requireSignIn,
  projectController.getProjectByDepartment
);

router.get(
  "/by-departments",
  requireSignIn,
  isAdminOrStaff,
  projectController.getProjectByDepartments
);

// Post routes
router.post("/create", requireSignIn, isAdmin, projectController.createProject);

// delete routes
router.delete(
  "/:_id",
  requireSignIn,
  isAdmin,
  projectController.deleteProjectById
);

// Put routes
router.put(
  "/:_id",
  requireSignIn,
  isAdmin,
  projectController.updateProjectById
);

module.exports = router;
