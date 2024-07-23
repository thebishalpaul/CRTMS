const express = require("express");
const taskController = require("../controllers/taskController");
const router = express.Router();
const {
  requireSignIn,
  isRequester,
  isStaff,
  isApprover,
  isAdminOrStaff,
  isRequesterOrApprover,
  isAdminOrApprover,
  isAdminStaffDeveloper,
  isAdmin,
  isDeveloper,
} = require("../middlewares/auth");

// POST
router.post(
  "/create",
  requireSignIn,
  isAdminOrStaff,
  taskController.createTask
);

// GET
router.get('/user-tasks', requireSignIn, isStaff, taskController.getUserTasks);
router.get('/all', requireSignIn, isAdmin, taskController.getAllTasks);
router.get("/my-tasks", requireSignIn, isDeveloper, taskController.getMyTasks);
router.get('/:id', requireSignIn, isAdminStaffDeveloper, taskController.getTaskById);

// DELETE
router.delete('/delete/:id', requireSignIn, isAdminOrStaff, taskController.deleteTask);

//PUT
router.put('/update/:id', requireSignIn, isAdminOrStaff, taskController.updateTask);
router.put("/change-status/:id", requireSignIn, taskController.changeStatus);



module.exports = router;