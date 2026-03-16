const express = require("express");
const {
  getAccount,
  getTransactions,
} = require("../../controller/user/accountController");
const { protect } = require("../../middleware/authMiddleware");
const { isVerifiedEmail } = require("../../middleware/verifyEmail");

const router = express.Router();

router.get("/getAccount", protect, isVerifiedEmail, getAccount);
router.get("/getTransactions", protect, isVerifiedEmail, getTransactions);

module.exports = router;
