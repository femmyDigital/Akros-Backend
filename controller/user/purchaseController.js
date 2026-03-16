const Account = require("../../model/account");
const Transaction = require("../../model/transaction");
const Purchase = require("../../model/purchase");

const buyData = async (req, res, next) => {
  const userId = req.user.id;
  const { network, phoneNumber, amount, planCode } = req.body;

  try {
    const account = await Account.findOne({ userId });

    if (account.balance < amount) {
      const error = new Error("Insufficient balance");
      error.statusCode = 400;
      throw error;
    }

    // Deduct account
    const newBalance = account.balance - amount;

    await account.updateOne({ balance: newBalance });

    const tx = await Transaction.create({
      userId,
      type: "DEBIT",
      amount,
      balanceBefore: account.balance,
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
