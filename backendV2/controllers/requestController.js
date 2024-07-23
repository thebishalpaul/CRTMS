const Institute = require("../models/Institute");
const User = require("../models/User");
const Division = require("../models/Division");
const Request = require("../models/Request");
const Project = require("../models/Project");
const Level = require("../models/Level");
const path = require("path");
const { default: slugify } = require("slugify");
const historyService = require("../services/historyService");

exports.createRequestController = async (req, res) => {
  try {
    const { title, description, projectId, request_type } = req.body;

    if (!title || !description || !projectId || !request_type) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const user = await User.findById(req.user._id).populate("institute");

    const slug = slugify(title.toLowerCase());

    const existingRequest = await Request.findOne({
      slug,
      institute: user.institute._id,
      projectId,
      requestType: request_type,
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: `A ${request_type} request with this title already exists`,
      });
    }

    let status = "awaiting-approval";
    if (user.role === "requester-admin") {
      status = "approved";
    } else {
      const requestFlow = user.institute.request_flow;
      if (request_type === "ticket" && requestFlow.ticket_request === false) {
        status = "approved";
      } else if (
        request_type === "change" &&
        requestFlow.change_request === false
      ) {
        status = "approved";
      }
    }

    const newRequest = new Request({
      title,
      description,
      slug,
      attachments: [],
      createdBy: req.user._id,
      projectId,
      requestType: request_type,
      institute: user.institute._id,
      status,
    });

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        newRequest.attachments.push({
          name: file.filename,
        });
      }
    }

    await newRequest.save();

    // Create a history entry using the HistoryService
    await historyService.createHistory({
      heading: `New ${request_type?.capitalize()} Request Created`,
      description: `${request_type?.capitalize()} Request with title '${title}' is created by ${user.name
        }`,
      targetModel: "request",
      target: newRequest._id,
      variant: "create",
      user: user._id,
    });

    if (status === "approved") {
      await historyService.createHistory({
        heading: `${request_type?.capitalize()} Request Approved`,
        description: `${request_type?.capitalize()} Request with title '${title}' is approved`,
        targetModel: "request",
        target: newRequest._id,
        variant: "create",
        user: user._id,
      });
    }

    res.status(201).json({
      success: true,
      message: "Request created successfully",
      request: newRequest,
    });
  } catch (error) {
    console.error("Error creating change request:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};


exports.getAllRequests = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    let requests;
    // console.log("get all request called");
    // console.log(user);
    if (user.role === "manager-admin" || user.role === "manager-staff") {
      const institutes = await Institute.find({
        manager_institute: user.institute,
      });
      const instituteIds = institutes.map((institute) => institute._id);
      requests = await Request.find({
        institute: { $in: instituteIds },
        status: {
          $nin: ["awaiting-approval", "rejected"]
        },
      })
        .populate("createdBy")
        .populate("projectId")
        .populate("institute");
    }
    else {
      requests = await Request.find({ institute: user.institute })
        .populate("createdBy")
        .populate("projectId");
    }
    return res.status(200).json({ success: true, requests });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getRequesterStaffRequests = async (req, res) => {
  try {
    const requests = await Request.find({ createdBy: req.user._id }).populate(
      "projectId"
    );
    // console.log("REQ " + requests);
    return res.status(200).json({ success: true, requests });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getPendingRequest = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const requests = await Request.find({
      institute: user.institute,
      status: "awaiting-approval",
    })
      .populate("createdBy")
      .populate("projectId");

    return res.status(200).json({ success: true, requests });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getChangeRequest = async (req, res) => {
  const { divisionId } = req.params;
  console.log(divisionId);

  try {
    const projects = await Project.find({ manager_division: divisionId });

    const projectIds = projects.map((project) => project._id);

    const changeRequests = await ChangeRequest.find({
      projectId: { $in: projectIds },
      status: "pending",
    })
      .populate("createdBy")
      .populate("projectId");

    return res.status(200).json({ success: true, changeRequests });
  } catch (error) {
    console.error("Error fetching change requests:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

exports.getChangeRequestByRole = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    console.log(user);
    let projects = null;
    let projectIds = null;
    let changeRequests = null;

    switch (user?.role) {
      case "approver":
        const { manager_division } = await Institute.findOne({
          admin: req.user,
        });
        projects = await Project.find({ manager_division });
        projectIds = projects.map((project) => project._id);

        changeRequests = await ChangeRequest.find({
          projectId: { $in: projectIds },
        })
          .populate("createdBy")
          .populate("projectId");
        break;
      case "admin":
        const divisions = await Division.find({
          Institute: user.institute,
        }).select("_id");
        console.log(divisions);
        projects = await Project.find({
          manager_division: {
            $in: divisions,
          },
        });
        projectIds = projects.map((project) => project._id);

        changeRequests = await ChangeRequest.find({
          projectId: { $in: projectIds },
          status: "approved",
        })
          .populate("createdBy")
          .populate("projectId");
        break;
      case "staff":
        projects = await Project.find({
          manager_division: {
            $in: user.divisions.map((division) => division._id),
          },
        });
        projectIds = projects.map((project) => project._id);

        changeRequests = await ChangeRequest.find({
          projectId: { $in: projectIds },
          status: "approved",
        })
          .populate("createdBy")
          .populate("projectId");
        break;
      case "requester":
        changeRequests = await ChangeRequest.find({
          createdBy: user?._id,
        })
          .populate("createdBy")
          .populate("projectId");
        break;
      default:
        break;
    }

    return res.status(200).json({ success: true, changeRequests });
  } catch (error) {
    console.error("Error fetching change requests:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

exports.getChangeRequestById = async (req, res) => {
  try {
    const changeRequest = await ChangeRequest.findById(req.params._id)
      .populate("createdBy")
      .populate("projectId");

    return res.status(200).json({ success: true, changeRequest });
  } catch (error) {
    console.error("Error fetching change requests:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { changeRequestId } = req.params;
    const { status } = req.body;

    const changeRequest = await ChangeRequest.findById(changeRequestId);

    if (!changeRequest) {
      return res
        .status(404)
        .json({ success: false, message: "ChangeRequest not found" });
    }

    changeRequest.status = status;
    await changeRequest.save();

    return res.status(200).json({
      success: true,
      message: "ChangeRequest status updated successfully",
    });
  } catch (error) {
    console.error("Error updating ChangeRequest status:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

exports.approveRequest = async (req, res) => {
  const { id } = req.body;
  try {
    const user = await User.findById(req.user._id);
    const request = await Request.findById(id);
    if (!request) {
      return res
        .status(404)
        .json({ success: false, message: "Request not found" });
    }
    request.status = "approved";
    await request.save();
    // Create a history entry using the HistoryService
    await historyService.createHistory({
      heading: `${request?.requestType?.capitalize()} Request approved`,
      description: `${request?.requestType?.capitalize()} Request with title '${request.title
        }' is approved by ${user.name}`,
      targetModel: "request",
      target: request._id,
      variant: "update",
      user: user._id,
    });
    return res
      .status(200)
      .json({ success: true, message: "Request approved successfully" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

exports.rejectRequest = async (req, res) => {
  const { id } = req.body;
  try {
    const user = await User.findById(req.user._id);
    const request = await Request.findById(id);
    if (!request) {
      return res
        .status(404)
        .json({ success: false, message: "Request not found" });
    }
    request.status = "rejected";
    await request.save();
    // Create a history entry using the HistoryService
    await historyService.createHistory({
      heading: `${request?.requestType?.capitalize()} Request rejected`,
      description: `${request?.requestType?.capitalize()} Request with title '${request.title
        }' is rejected by ${user.name}`,
      targetModel: "request",
      target: request._id,
      variant: "update",
      user: user._id,
    });
    return res
      .status(200)
      .json({ success: true, message: "Request rejected successfully" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

exports.updateChangeRequest = async (req, res) => {
  try {
    const { _id } = req.params;

    const changeRequest = await Request.findByIdAndUpdate(_id, req.body);

    if (!changeRequest) {
      return res
        .status(404)
        .json({ success: false, message: "ChangeRequest not found" });
    }

    return res.status(200).json({
      success: true,
      message: "ChangeRequest status updated successfully",
      changeRequest,
    });
  } catch (error) {
    console.error("Error updating ChangeRequest status:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

exports.getManagerStaffRequests = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const level = await Level.findById(user.level);

    const projectIds = user.projects.map((project) => project._id);
    const requests = await Request.find({
      projectId: { $in: projectIds },
      status: { $ne: "awaiting-approval" },
    })
      .populate("createdBy")
      .populate("projectId")
      .populate("institute");

    return res.status(200).json({ success: true, requests });
  } catch (error) {
    console.error("Error fetching manager-staff requests:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getRequestById = async (req, res) => {
  try {
    const requestId = req.params.id;
    if (!requestId) {
      return res.status(404).json({ message: "Request ID is required" });
    }

    const request = await Request.findById(requestId)
      .populate("createdBy")
      .populate("projectId")
      .populate("institute");

    return res.status(200).json({ success: true, request });
  } catch (error) {
    console.error("Error fetching manager-staff requests:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.changeStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("level");
    // console.log("🚀 ~ exports.changeStatus= ~ user:", user);
    const id = req.params._id;
    const status = req.body.status;
    const levels = await Level.find({
      institute: user?.institute,
    });
    const request = await Request.findById(id);
    if (!request) {
      return res
        .status(404)
        .json({ success: false, message: "Request not found" });
    }

    const history = {
      heading: `${request?.requestType?.capitalize()} Request status changed`,
      description: `${request?.requestType?.capitalize()} Request with title '${request.title
        }' is changed by ${user.name}`,
      targetBefore: request,
      targetModel: "request",
      target: request._id,
      variant: "update",
      user: user._id,
    };

    request.status = status;

    //Check for access

    if (status === "completed" && user.role === "manager-staff") {
      levels.forEach(({ access, _id }) => {
        if (
          (access?.approve_response_to_change_request &&
            request.requestType === "change") ||
          (access?.approve_response_to_ticket_request &&
            request.requestType === "ticket")
        )
          request.status = "complete-requested";
      });
    }

    // If user is admin no need to check
    if (user.role === "manager-admin") {
      request.status = status;
      if (status == "completed")
        request.completedAt = new Date();
    }

    // otherwise If it has access then change directly
    if (
      (user?.level?.access?.approve_response_to_change_request &&
        request.requestType === "change") ||
      (user?.level?.access?.approve_response_to_ticket_request &&
        request.requestType === "ticket")
    ) {
      request.status = status;
      console.log("🚀 ~ exports.changeStatus= ~ request:", request);
    }

    await request.save();
    // Create a history entry using the HistoryService
    await historyService.createHistory(history);
    return res
      .status(200)
      .json({ success: true, message: `Status changed to ${request.status}` });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
