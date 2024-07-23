const express = require("express");
const router = express.Router();
// const fileUpload = require("express-fileupload");
const requestController = require("../controllers/requestController");
const {
  requireSignIn,
  isRequester,
  isStaff,
  isApprover,
  isAdminOrStaff,
  isRequesterOrApprover,
  isAdminOrApprover,
} = require("../middlewares/auth");

const multer = require("multer");
const path = require("path");

// GET ROUTES
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "..", "uploads");
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now();
    const filename = uniqueSuffix + "-" + file.originalname;
    file.filename = filename;
    cb(null, filename);
  },
});

// GET
router.get("/all", requireSignIn, requestController.getAllRequests);
router.get(
  "/requester-staff-requests",
  requireSignIn,
  isRequester,
  requestController.getRequesterStaffRequests
);
router.get(
  "/pending-request",
  requireSignIn,
  isApprover,
  requestController.getPendingRequest
);
router.get(
  "/manager-staff-requests",
  requireSignIn,
  isStaff,
  requestController.getManagerStaffRequests
);

router.get(
  "/:id",
  requireSignIn,
  isAdminOrStaff,
  requestController.getRequestById
);

// POST ROUTES
const upload = multer({ storage: storage });
router.post(
  "/create-request",
  requireSignIn,
  isRequesterOrApprover,
  upload.array("attachments"),
  requestController.createRequestController
);

// UPDATE ROUTES
router.put(
  "/updateStatus/:requestControllerId",
  requireSignIn,
  isAdminOrStaff,
  requestController.updateStatus
);

router.put(
  "/approve-request",
  requireSignIn,
  isApprover,
  requestController.approveRequest
);

router.put(
  "/reject-request",
  requireSignIn,
  isApprover,
  requestController.rejectRequest
);

router.put(
  "/change-status/:_id",
  requireSignIn,
  isAdminOrStaff,
  requestController.changeStatus
);

module.exports = router;
