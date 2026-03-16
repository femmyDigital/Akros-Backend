const express = require("express");
const { getWallet } = require("../../controller/user/walletController");

const router = express.Router();

router.get("/getWallet", getWallet);
// router.get("/generateAccount", generateVirtualAccount);

module.exports = router;
