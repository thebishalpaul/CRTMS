const { default: slugify } = require("slugify");
const Department = require("../models/Department");
const User = require("../models/User");
const Level = require("../models/Level");
const Division = require("../models/Division");
const Project = require("../models/Project");
const Institute = require("../models/Institute");
const { default: mongoose } = require("mongoose");

exports.updateAccess = async (req, res) => {
    try {
        const userId = req.user._id;
        const { newAccessLevel } = req.body;

        // Find the user by ID
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Find the user's institute
        const institute = await Institute.findById(user.institute);

        if (!institute) {
            return res.status(404).json({ message: 'Institute not found' });
        }

        // Update the access level in the institute table
        institute.access = [{
            manage_change_request: newAccessLevel.manage_change_request,
            manage_ticket_request: newAccessLevel.manage_ticket_request
        }]
        await institute.save();

        res.status(200).json({ message: 'Access level updated successfully' });
    } catch (error) {
        console.error('Error updating access level:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};