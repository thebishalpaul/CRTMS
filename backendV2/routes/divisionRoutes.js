const express = require("express");
const router = express.Router();
const divisionController = require("../controllers/divisionController");
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
  divisionController.getAllDivisions
);

// Post routes
router.post(
  "/create",
  requireSignIn,
  isAdmin,
  divisionController.createDivision
);

// delete routes
router.delete(
  "/:_id",
  requireSignIn,
  isAdmin,
  divisionController.deleteDivisionById
);
module.exports = router;
