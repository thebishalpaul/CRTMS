const express = require("express");
const router = express.Router();
const levelController = require("../controllers/levelController");
const {
  requireSignIn,
  isAdminOrApprover,
  isAdmin,
  isAdminOrStaff,
  isStaff,
} = require("../middlewares/auth");

// Get routes
router.get("/all", requireSignIn, isAdminOrStaff, levelController.getAllLevels);

// Post routes
router.post("/create", requireSignIn, isAdmin, levelController.createLevel);

// delete routes
router.delete("/:_id", requireSignIn, isAdmin, levelController.deleteLevelById);

// update routes
router.put("/:_id", requireSignIn, isAdmin, levelController.updateLevelById);
router.put(
  "/change_configuration/:_id",
  requireSignIn,
  isStaff,
  levelController.changeConfiguration
);

module.exports = router;
