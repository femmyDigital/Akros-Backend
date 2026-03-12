const axios = require("axios");
const User = require("../../model/user");
const Transaction = require("../../model/transaction");

const createVirtualAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.virtualAccount?.accountNumber) {
      return res.status(400).json({
        message: "Virtual account already exists",
        account: user.virtualAccount,
      });
    }

    const response = await axios.post(
      `${process.env.STROWALLET_BASE_URL}/virtual-account`,
      {
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.STROWALLET_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    const account = response.data.data;

    user.virtualAccount = {
      accountNumber: account.account_number,
      accountName: account.account_name,
      bankName: account.bank_name,
    };

    await user.save();

    res.status(200).json({
      message: "Virtual account created",
      account: user.virtualAccount,
    });
  } catch (error) {
    console.error(error.response?.data || error.message);

    res.status(500).json({
      message: "Virtual account creation failed",
    });
  }
};

const getWallet = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);

    res.json({
      walletBalance: user.walletBalance,
      virtualAccount: user.virtualAccount,
    });
  } catch (error) {
    res.status(500).json({
      message: "Unable to fetch wallet",
    });
  }
};

const strowalletWebhook = async (req, res) => {
  try {
    const { account_number, amount, reference } = req.body.data;

    const user = await User.findOne({
      "virtualAccount.accountNumber": account_number,
    });

    if (!user) {
      return res.sendStatus(404);
    }

    const existing = await Transaction.findOne({
      reference,
    });

    if (existing) {
      return res.sendStatus(200);
    }

    user.walletBalance += amount;

    await user.save();

    await Transaction.create({
      user: user._id,
      amount,
      reference,
      type: "credit",
      status: "success",
      description: "Wallet funding",
    });

    res.sendStatus(200);
  } catch (error) {
    console.error(error);

    res.sendStatus(500);
  }
};

const debitWallet = async (userId, amount, description) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  if (user.walletBalance < amount) {
    throw new Error("Insufficient wallet balance");
  }

  user.walletBalance -= amount;

  await user.save();

  const transaction = await Transaction.create({
    user: user._id,
    amount,
    type: "debit",
    status: "success",
    description,
  });

  return transaction;
};

const creditWallet = async (userId, amount, description) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  user.walletBalance += amount;

  await user.save();

  const transaction = await Transaction.create({
    user: user._id,
    amount,
    type: "credit",
    status: "success",
    description,
  });

  return transaction;
};

const getTransactions = async (req, res) => {
  try {
    const userId = req.user.id;

    const transactions = await Transaction.find({
      user: userId,
    }).sort({ createdAt: -1 });

    res.json({
      transactions,
    });
  } catch (error) {
    res.status(500).json({
      message: "Unable to fetch transactions",
    });
  }
};

module.exports = {
  createVirtualAccount,
  getWallet,
  strowalletWebhook,
  debitWallet,
  creditWallet,
  getTransactions,
};
