const express = require("express");
const {
  getNotification,
  markAllAsRead,
  markAsRead,
} = require("../../controller/user/notificationController");
const { protect } = require("../../middleware/authMiddleware");
const { isVerifiedEmail } = require("../../middleware/verifyEmail");

const router = express.Router();

router.get("/get", protect, getNotification);
router.put("/mark", protect, isVerifiedEmail, markAsRead);
router.put("/markAll", protect, isVerifiedEmail, markAllAsRead);
module.exports = router;
