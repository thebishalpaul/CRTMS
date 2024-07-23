const express = require('express');
const notificationController = require('../controllers/notificationController');
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

router.get("/all",
    requireSignIn,
    notificationController.getAllNotifications
);
router.put("/markRead",
    requireSignIn,
    notificationController.markReadNotifications
);

module.exports = router;