const express = require("express");
const {
  getUserTransactions,
} = require("../../controller/user/transactionController");
const { protect } = require("../../middleware/authMiddleware");
const { isVerifiedEmail } = require("../../middleware/verifyEmail");

const router = express.Router();

router.get("/getTransaction", protect, isVerifiedEmail, getUserTransactions);

module.exports = router;
