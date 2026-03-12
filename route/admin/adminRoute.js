const express = require("express");
const { adminCreditWallet } = require("../../controller/admin/adminController");

const router = express.Router();

router.post("/creditWallet", adminCreditWallet);

module.exports = router;
