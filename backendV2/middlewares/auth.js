const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Division = require("../models/Division");

// Protected routes token based
const requireSignIn = async (req, res, next) => {
  try {
    const decode = jwt.verify(
      req.headers.authorization,
      process.env.JWT_SECRET
    );
    req.user = decode;
    console.log(decode);
    next();
  } catch (error) {
    console.log("error line 18: " + error);
    return res.status(401).send({
      success: false,
      message: "Signin Unauthorized Access",
    });
  }
};

const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (user?.role === "manager-admin") {
      next();
    } else {
      return res.status(401).send({
        success: false,
        message: "Unauthorized Access",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(401).send({
      success: false,
      message: "Unauthorized Access",
    });
  }
};
const isDeveloper = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (user?.role === "developer") {
      next();
    } else {
      return res.status(401).send({
        success: false,
        message: "Unauthorized Access",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(401).send({
      success: false,
      message: "Unauthorized Access",
    });
  }
};
const isSuperAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (user.role === "super-admin") {
      next();
    } else {
      return res.status(401).send({
        success: false,
        message: "Unauthorized Access",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(401).send({
      success: false,
      message: "Unauthorized Access",
    });
  }
};

const isApprover = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    // console.log(user);

    if (user.role === "requester-admin") {
      next();
    } else {
      return res.status(401).send({
        success: false,
        message: "Unauthorized Access",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(401).send({
      success: false,
      message: "Unauthorized Access",
    });
  }
};

const isAdminOrApprover = async (req, res, next) => {
  try {
    // console.log("user id: "+req.user._id);
    const user = await User.findById(req.user._id);
    if (user.role === "manager-admin" || user.role === "requester-admin") {
      next();
    } else {
      return res.status(401).send({
        success: false,
        message: "Unauthorized Access Not an Admin or Approver",
      });
    }
  } catch (error) {
    console.log("auth error: " + error);
    return res.status(401).send({
      success: false,
      message: "Unauthorized Access",
    });
  }
};
const isAdminOrStaff = async (req, res, next) => {
  try {
    // console.log("user id: "+req.user._id);
    const user = await User.findById(req.user._id);
    if (user.role === "manager-admin" || user.role === "manager-staff") {
      next();
    } else {
      return res.status(401).send({
        success: false,
        message: "Unauthorized Access Not an Admin or Approver",
      });
    }
  } catch (error) {
    console.log("auth error: " + error);
    return res.status(401).send({
      success: false,
      message: "Unauthorized Access",
    });
  }
};
const isAdminStaffDeveloper = async (req, res, next) => {
  try {
    // console.log("user id: "+req.user._id);
    const user = await User.findById(req.user._id);
    if (user.role === "manager-admin" || user.role === "manager-staff" || user.role === "developer") {
      next();
    } else {
      return res.status(401).send({
        success: false,
        message: "Unauthorized Access Not an Admin or Approver",
      });
    }
  } catch (error) {
    console.log("auth error: " + error);
    return res.status(401).send({
      success: false,
      message: "Unauthorized Access",
    });
  }
};
const isRequesterOrApprover = async (req, res, next) => {
  try {
    // console.log("user id: "+req.user._id);
    const user = await User.findById(req.user._id);
    if (user.role === "requester-staff" || user.role === "requester-admin") {
      next();
    } else {
      return res.status(401).send({
        success: false,
        message: "Unauthorized Access Not an Requester or Approver",
      });
    }
  } catch (error) {
    console.log("auth error: " + error);
    return res.status(401).send({
      success: false,
      message: "Unauthorized Access",
    });
  }
};

const isRequester = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    console.log(user);
    if (user.role === "requester-staff") {
      next();
    } else {
      return res.status(401).send({
        success: false,
        message: "Unauthorized Access",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(401).send({
      success: false,
      message: "Unauthorized Access",
    });
  }
};

const isStaff = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (user.role === "manager-staff") {
      next();
    } else {
      return res.status(401).send({
        success: false,
        message: "Unauthorized Access",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(401).send({
      success: false,
      message: "Unauthorized Access",
    });
  }
};

const isVerified = async (req, res, next) => {
  console.log(req.user);
  try {
    const user = await User.findById(req.user._id);
    console.log(user);
    if (user.status === "verified") {
      next();
    } else {
      return res.status(401).send({
        success: false,
        message: "Unauthorized Access",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(401).send({
      success: false,
      message: "Unauthorized Access",
    });
  }
};

const isActive = async (req, res, next) => {
  console.log(req.user);
  try {
    const user = await User.findById(req.user._id);
    console.log(user);
    if (user.status === "active") {
      next();
    } else {
      return res.status(401).send({
        success: false,
        message: "Unauthorized Access",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(401).send({
      success: false,
      message: "Unauthorized Access",
    });
  }
};

const isTopLevel = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const division = await Division.findById(user.division);
    const levels = division.levels;
    const level = levels.find((level) => level.current.equals(user.current));

    if (level.parent == null) {
      next();
    } else {
      return res.status(401).send({
        success: false,
        message: "Not Top Level",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(401).send({
      success: false,
      message: "Unauthorized Access",
    });
  }
};

module.exports = {
  requireSignIn,
  isAdmin,
  isDeveloper,
  isApprover,
  isStaff,
  isRequester,
  isVerified,
  isActive,
  isAdminOrApprover,
  isTopLevel,
  isSuperAdmin,
  isAdminOrStaff,
  isRequesterOrApprover,
  isAdminStaffDeveloper
};
