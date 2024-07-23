const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    target: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, "Target is required"],
        refPath: "targetModel",
    },
    targetModel: {
        type: String,
        required: [true, "Target model is required"],
        enum: [
            "request",
            "project",
        ],
    },
    description: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ["to-do", "in-progress", "completed"],
        default: "to-do",
    },
    priority: {
        type: String,
        enum: ["low", "medium", "high"],
        default: "medium"
    },
    deadline: {
        type: Date,
        required: true,
    },
    userAssigned: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    institute: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "institute"
    }
},
    { timestamps: true }
);

module.exports = mongoose.model('task', taskSchema);