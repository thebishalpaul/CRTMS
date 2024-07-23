const express = require('express');
const router = express.Router();
const countController = require('../controllers/countController');
const {
    requireSignIn,
    isAdminOrApprover,
    isAdmin,
    isSuperAdmin,
    isAdminOrStaff,
} = require("../middlewares/auth");

router.get(
    '/institutes',
    requireSignIn,
    isSuperAdmin,
    countController.getInstituteCount
);

router.get(
    '/projects',
    requireSignIn,
    isAdminOrStaff,
    countController.getProjectsCount
);

router.get(
    '/requests',
    requireSignIn,
    isAdminOrStaff,
    countController.getRequestsCount
);

router.get(
    '/topProjects',
    requireSignIn,
    isAdminOrStaff,
    countController.getTopProjects
);


module.exports = router;