const express = require("express");
const {
  LoginController,
  SignupController,
  validationController,
} = require("../controllers/auth");

const {
  requireSignIn,
  isAdmin,
  isApprover,
  isRequester,
  isStaff,
  isTopLevel,
  isSuperAdmin,
  isDeveloper,
} = require("../middlewares/auth");
const router = express.Router();

router.post("/validate", validationController);
router.post("/signup", SignupController);
router.post("/signin", LoginController);
router.get("/user-auth", requireSignIn, (req, res) => {
  res.status(200).send({ ok: true });
});
router.get("/requester-admin-auth", requireSignIn, isApprover, (req, res) => {
  res.status(200).send({ ok: true });
});
router.get("/manager-admin-auth", requireSignIn, isAdmin, (req, res) => {
  res.status(200).send({ ok: true });
});

router.get("/super-admin-auth", requireSignIn, isSuperAdmin, (req, res) => {
  res.status(200).send({ ok: true });
});

router.get("/requester-staff-auth", requireSignIn, isRequester, (req, res) => {
  res.status(200).send({ ok: true });
});

router.get("/manager-staff-auth", requireSignIn, isStaff, (req, res) => {
  res.status(200).send({ ok: true });
});

router.get("/developer-auth", requireSignIn, isDeveloper, (req, res) => {
  res.status(200).send({ ok: true });
});

router.get("/top-level", requireSignIn, isStaff, isTopLevel, (req, res) => {
  res.status(200).send({ ok: true });
});

module.exports = router;