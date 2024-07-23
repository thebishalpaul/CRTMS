// routes/configRoutes.js

const express = require("express");
const roles = require("../helpers/role");
const router = express.Router();

// CRUD operations
router.get("/roles", (req, res) => {
  try {
    res.status(201).json({
      success: true,
      roles,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
