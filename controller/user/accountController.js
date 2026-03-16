const axios = require("axios");
const Account = require("../../model/account");
const Transaction = require("../../model/transaction");

const getAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    const account = await Account.findOne({ user: userId });

    if (!account) {
      const error = new Error("Account not Found");
      error.statusCode = 404;
      throw error;
    }

    res.status(201).json({
      success: true,
      message: "Account Fetched successfully",
      data: account,
    });
  } catch (error) {
    res.status(500).json({
      message: "Unable to fetch wallet",
    });
  }
};

const getTransactions = async (req, res) => {
  try {
    const userId = req.user.id;

    const transactions = await Transaction.findOne({
      user: userId,
    }).sort({ createdAt: -1 });

    res.status(201).json({
      success: true,
      message: "Transaction Fetched successfully",
      data: transactions,
    });
  } catch (error) {
    res.status(500).json({
      message: "Unable to fetch transactions",
    });
  }
};

module.exports = {
  getAccount,
  getTransactions,
};
