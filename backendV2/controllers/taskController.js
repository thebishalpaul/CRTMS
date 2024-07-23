const mongoose = require('mongoose');
const User = require("../models/User");
const Task = require("../models/Task");
const Request = require("../models/Request");
const historyService=require("../services/historyService");
const notificationService = require("../services/notificationService");

exports.createTask = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(req.user._id).session(session);
    const { title, target, description, priority, deadline, developer, targetModel } = req.body;

    if (!title || !target || !description || !deadline || !developer) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const newTask = new Task({
      title,
      target,
      targetModel,
      description,
      priority: priority.toLowerCase(),
      deadline,
      userAssigned: developer,
      createdBy: user._id,
      institute: user.institute
    });

    const savedTask = await newTask.save({ session });

    // Create a history entry using the HistoryService
    await historyService.createHistory({
      heading: `New Task Created`,
      description: `Task with title '${title}' is created by ${user.name}`,
      targetModel: "task",
      target: savedTask._id,
      variant: "create",
      user: user._id,
    }, session); 

    await notificationService.createNotification({
      user:developer,
      message:`A new task "${title}" has been assigned to you by ${user.name}.`,
    }, session);
    
    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ success: true, task: savedTask });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ success: false, message: error.message });
  }
};


exports.getUserTasks = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const tasks = await Task.find({ createdBy: userId })
      .populate('target')
      .populate('userAssigned')

    res.status(200).json({ success: true, tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
exports.getMyTasks = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    console.log(user);
    const tasks = await Task.find({
      institute: user.institute,
      userAssigned: user?._id,
    })
      .populate("target")
      .populate("userAssigned");
      
    res.status(200).json({
      success: true,
      tasks,
    });
  } catch (error) {
    console.log("error: ")
    console.log(error)
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
exports.getAllTasks = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    // console.log("TASKSSSS: ");
    const tasks = await Task.find({ institute: user.institute })
      .populate('target')
      .populate('userAssigned')

    // console.log(tasks);

    res.status(200).json({
      success: true,
      tasks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
exports.getTaskById = async (req, res) => {
  try {
    const taskId = req.params.id;
    const task = await Task.findById(taskId)
      .populate('userAssigned')
      .populate('createdBy')
      .populate('institute')
      .populate('target');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.status(200).json({ success: true, task });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
}

exports.deleteTask = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const user= await User.findById(req.user._id).session(session);
    const taskId = req.params.id;
    const task = await Task.findById(taskId).session(session);

    if (!task) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    if (task.createdBy.toString() !== req.user._id.toString() && !req.user.role.includes("manager-admin")) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({ success: false, message: "Unauthorized action" });
    }

    await Task.findByIdAndDelete(taskId).session(session);;

     // Create a history entry using the HistoryService
     await historyService.createHistory({
      heading: `Task Deleted`,
      description: `Task with title '${task.title}' is deleted by ${user.name
        }`,
      targetModel: "task",
      target: task._id,
      variant: "delete",
      user: user._id,
    },session);
    
    await session.commitTransaction();
    session.endSession();
    res.status(200).json({ success: true, message: "Task deleted successfully" });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ success: false, message: error.message });
  }
};


exports.updateTask = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const taskId = req.params.id;
    const { title, description, priority, deadline, developer } = req.body;

    const updatedPriority = priority.toLowerCase();

    const updateData = {
      title,
      description,
      priority: updatedPriority,
      deadline,
      userAssigned: developer
    };

    const updatedTask = await Task.findByIdAndUpdate(taskId, updateData, { new: true, session });

    if (!updatedTask) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    const user = await User.findById(req.user._id).session(session);

    // Create a history entry using the HistoryService
    await historyService.createHistory({
      heading: `Task Updated`,
      description: `Task with title '${title}' is updated by ${user.name}`,
      targetModel: "task",
      target: updatedTask._id,
      variant: "update",
      user: user._id,
    }, session);

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      task: updatedTask,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error updating task:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

exports.changeStatus = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const taskId = req.params.id;
    const status = req.body.status;

    if (!taskId || !status) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Task ID and Status are required" });
    }

    const task = await Task.findByIdAndUpdate(taskId, { status }, { new: true, session });

    if (!task) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    const user = await User.findById(req.user._id).session(session);

    // Create a history entry using the HistoryService
    await historyService.createHistory({
      heading: `Task Status Changed`,
      description: `Task with title '${task.title}' status changed to '${status}' by ${user.name}`,
      targetModel: "task",
      target: task._id,
      variant: "update",
      user: user._id,
    }, session); 

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ success: true, message: "Status changed successfully", task });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};