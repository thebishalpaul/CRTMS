// routes/configRoutes.js
const express = require("express");
const router = express.Router();
const instituteController = require("../controllers/instituteController");
const {
  requireSignIn,
  isAdmin,
  isVerified,
  isApprover,
  isRequester,
  isStaff,
  isActive,
  isAdminOrApprover,
  isSuperAdmin,
  isAdminOrStaff,
} = require("../middlewares/auth");

// Get Routes

router.get(
  "/manager",
  requireSignIn,
  isSuperAdmin,
  instituteController.getManagerInstitutes
);

router.get(
  "/requester",
  requireSignIn,
  isAdminOrStaff,
  instituteController.getRequesterInstitutes
);

router.get(
  "/configuration",
  requireSignIn,
  isAdminOrStaff,
  instituteController.getConfiguration
);

router.get(
  "/requestFlow",
  requireSignIn,
  isApprover,
  instituteController.getRequestFlow
);

// Post Routes

router.post(
  "/manager",
  requireSignIn,
  isSuperAdmin,
  instituteController.createManagerInstitute
);

router.post(
  "/requester",
  requireSignIn,
  isAdmin,
  instituteController.createRequesterInstitute
);

// put routes
router.put(
  "/configuration",
  requireSignIn,
  isAdmin,
  instituteController.updateConfiguration
);
router.put(
  "/requestFlow",
  requireSignIn,
  isApprover,
  instituteController.updateRequestFlow
);
module.exports = router;
