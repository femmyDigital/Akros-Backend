const express = require("express");
const { makePayment } = require("../../controller/user/paymentController");

const router = express.Router();

router.post("/makePayment", makePayment);

module.exports = router;
