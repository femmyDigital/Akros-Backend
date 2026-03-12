const Wallet = require("../../model/wallet");
const Transaction = require("../../model/transaction");
const Purchase = require("../../model/purchase");

const buyData = async (req, res, next) => {
  const userId = req.user.id;
  const { network, phoneNumber, amount, planCode } = req.body;

  try {
    const wallet = await Wallet.findOne({ userId });

    if (wallet.balance < amount) {
      const error = new Error("Insufficient balance");
      error.statusCode = 400;
      throw error;
    }

    // Deduct wallet
    const newBalance = wallet.balance - amount;

    await wallet.updateOne({ balance: newBalance });

    const tx = await Transaction.create({
      userId,
      type: "DEBIT",
      amount,
      balanceBefore: wallet.balance,
      balanceAfter: newBalance,
      status: "SUCCESS",
      provider: "LOCAL_Automation",
    });

    // Record purchase
    const purchase = await Purchase.create({
      userId,
      network,
      phoneNumber,
      type: "DATA",
      amount,
      planCode,
      status: "PENDING",
    });

    /**
     * TODO: Call your SIM-hosting or aggregator API here
     * Example:
     * const result = await sendDataViaSIM(network, phoneNumber, planCode);
     */

    // Simulate success
    purchase.status = "SUCCESS";
    await purchase.save();

    res.json({
      success: true,
      message: "Data purchase successful",
      transaction: tx,
      purchase,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { buyData };
