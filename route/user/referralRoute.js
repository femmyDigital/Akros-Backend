const express = require("express");
const {
  getReferralStats,
} = require("../../controller/user/referralController");
const { protect } = require("../../middleware/authMiddleware");
const { isVerifiedEmail } = require("../../middleware/verifyEmail");

const router = express.Router();

router.get("/stat", protect, isVerifiedEmail, getReferralStats);

module.exports = router;
