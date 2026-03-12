const express = require("express");
const { buyData } = require("../../controller/user/purchaseController");
const { protect } = require("../../middleware/authMiddleware");
const { isVerifiedEmail } = require("../../middleware/verifyEmail");

const router = express.Router();

router.post("/buyData", protect, isVerifiedEmail, buyData);

module.exports = router;
