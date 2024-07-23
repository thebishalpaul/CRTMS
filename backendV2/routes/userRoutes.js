const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const {
  requireSignIn,
  isAdminOrApprover,
  isAdmin,
  isStaff,
  isAdminOrStaff,
  isApprover,
} = require("../middlewares/auth");

const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "..", "uploads/users");
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now();
    const filename = uniqueSuffix + "-" + file.originalname;
    file.filename = filename;
    cb(null, filename);
  },
});

const upload = multer({ storage: storage });

// Get routes
router.get("/all", requireSignIn, userController.getAllUsers);
router.get("/my-access", requireSignIn, isStaff, userController.getMyAccess);
router.get(
  "/all-requester-staff",
  requireSignIn,
  isApprover,
  userController.getRequesterStaff
);

router.get(
  "/developers",
  requireSignIn,
  isAdminOrStaff,
  userController.getDevelopers
);


router.get("/:_id", userController.getUserById);
router.get("/", requireSignIn, userController.getUserByToken);

// Post routes
router.post("/create", requireSignIn, isAdmin, userController.createUser);
router.post(
  "/create-requester-staff",
  requireSignIn,
  isApprover,
  userController.createRequesterStaff
);

router.post(
  "/upload-profile-image",
  requireSignIn,
  upload.array("profile_picture"),
  userController.uploadProfilePicture
);

router.post(
  "/create-developer",
  requireSignIn,
  isAdminOrStaff,
  userController.createDeveloper
);

// delete routes
router.delete("/:_id", requireSignIn, isAdmin, userController.deleteUserById);

// Put routes
router.put("/edit-profile", requireSignIn, userController.updateMyProfile);
router.put("/:_id", requireSignIn, isAdmin, userController.updateUserById);
module.exports = router;
