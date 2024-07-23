const Institute = require("../models/Institute");
const Project = require("../models/Project");
const Request = require("../models/Request");
const User = require("../models/User");
// const  mongoose  = require("mongoose");

exports.getInstituteCount = async (req, res) => {
    try {
        const count = await Institute.countDocuments({ institute_type: 'manager' });
        res.status(200).json({ success: true, count });
    } catch (error) {
        res.status(500).json({ error });
    }
}
exports.getProjectsCount = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        const query = { institute: user.institute, ...req.query };

        const count = await Project.countDocuments(query);

        res.status(200).json({ success: true, count });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}
exports.getRequestsCount = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        const query = { ...req.query };

        const requests = await Request.find(query).populate('projectId');

        const filteredRequests = requests.filter(request => request.projectId.institute.toString() === user.institute.toString());

        const count = filteredRequests.length;

        res.status(200).json({ success: true, count });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

exports.getTopProjects = async (req, res) => {
    try {
        const requestAggregation = await Request.aggregate([
            {
                $group: {
                    _id: '$projectId',
                    totalRequest: { $sum: 1 },
                    ticketRequest: {
                        $sum: {
                            $cond: [
                                { $eq: ["$requestType", "ticket"] },
                                1,
                                0
                            ]
                        }
                    },
                    changeRequest: {
                        $sum: {
                            $cond: [
                                { $eq: ["$requestType", "change"] },
                                1,
                                0
                            ]
                        }
                    },
                }
            },
            {
                $sort: { totalRequest: -1 }
            },
            {
                $limit: 5
            }
        ]);

        const projectIds = requestAggregation.map(item => item._id);
        const projects = await Project.find({ _id: { $in: projectIds } });

        const topProjects = projects.map(project => {
            const requestData = requestAggregation.find(item => item._id.toString() === project._id.toString());
            return {
                ...project.toObject(),
                totalRequests: requestData ? requestData.totalRequest : 0,
                ticketRequests: requestData ? requestData.ticketRequest : 0,
                changeRequests: requestData ? requestData.changeRequest : 0
            };
        });
        // console.log("OKK");
        // console.log(topProjects);
        res.status(200).json({ success: true, topProjects });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}