const Wallet = require("../../model/wallet");
const Transaction = require("../../model/transaction");

const adminCreditWallet = async (req, res, next) => {
  const { userId, amount } = req.body;

  try {
    const wallet = await Wallet.findOne({ userId });

    if (!wallet) {
      const error = new Error("Wallet Doesn't Exist, Generate");
      error.statusCode = 404;
      throw error;
    }

    const newBalance = wallet.balance + amount;

    await Transaction.create({
      userId,
      type: "FUND",
      amount,
      balanceBefore: wallet.balance,
      balanceAfter: newBalance,
      status: "SUCCESS",
      provider: "ADMIN",
    });

    await wallet.updateOne({ balance: newBalance });

    res.json({ success: true, message: "Wallet credited" });

    res.status(200).json({
      success: true,
      message: "Wallet Credited Successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { adminCreditWallet };
