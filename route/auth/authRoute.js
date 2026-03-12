const express = require("express");
const {
  signupUser,
  loginUser,
  logoutUser,
  authMiddleware,
  forgetPassword,
  confirmPassword,
  changePassword,
  sendVerifyEmailLink,
  resendEmailVerification,
  verifyEmail,
} = require("../../controller/auth/authController");

const router = express.Router();

router.post("/signup", signupUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/forgetPassword", forgetPassword);
router.post("/confirmPassword", confirmPassword);
router.post("/resendEmailLink/:tokenId", resendEmailVerification);
router.post("/sendEmailLink", sendVerifyEmailLink);
router.post("/changePassword/:userId", changePassword);
router.post("/verifyEmail/:token", verifyEmail);

router.get("/checkAuth", authMiddleware, (req, res) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    message: "User Authenticated!",
    user,
  });
});

module.exports = router;
