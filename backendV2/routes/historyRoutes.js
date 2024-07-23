const express = require("express");
const historyController = require("../controllers/historyController");
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

// Get routes
router.get("/all", requireSignIn, historyController.getAllHistories);

// Post routes
router.post("/create", requireSignIn, historyController.createHistory);

module.exports = router;