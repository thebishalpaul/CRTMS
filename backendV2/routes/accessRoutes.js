const express = require("express");
const {
  LoginController,
  SignupController,
  validationController,
} = require("../controllers/auth");

const {
  requireSignIn,
  isAdmin,
  isApprover,
  isRequester,
  isStaff,
  isTopLevel,
  isSuperAdmin,
} = require("../middlewares/auth");
const router = express.Router();

// Route to update access for a user in the institute table
router.put('/updateAccess', isApprover, accessController.updateAccess);

module.exports = router;
