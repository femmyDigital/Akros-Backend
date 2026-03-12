const Transaction = require("../../model/transaction");
const Wallet = require("../../model/wallet");
const WebhookLog = require("../../model/webhookLog");
const verifySignature = require("../../utility/verifyWebhookSignature");

const makePayment = async (req, res, next) => {
  try {
    const payload = req.body;
    const signature = req.headers["monnify-signature"];

    // Log webhook for debugging
    await WebhookLog.create({
      provider: "MONNIFY",
      event: payload.eventType,
      payload,
      signature,
    });

    // Verify
    if (!verifySignature(payload, signature)) {
      const error = new Error("Invalid Signature ");
      error.statusCode = 401;
      throw error;
    }

    const payment = payload.eventData;

    // Prevent duplicates
    let tx = await Transaction.findOne({
      providerReference: payment.paymentReference,
    });

    if (tx && tx.status === "SUCCESS") {
      return res.send("OK");
    }

    // Create transaction if not exists
    if (!tx) {
      tx = await Transaction.create({
        userId: payment.customerId,
        type: "FUND",
        amount: payment.paidAmount * 100, // convert to kobo
        providerReference: payment.paymentReference,
        status: "PENDING",
      });
    }

    // Update wallet
    const wallet = await Wallet.findOne({ userId: tx.userId });

    const newBalance = wallet.balance + tx.amount;

    await wallet.updateOne({ balance: newBalance });

    await tx.updateOne({
      status: "SUCCESS",
      balanceBefore: wallet.balance,
      balanceAfter: newBalance,
    });

    res.send("OK");
  } catch (error) {
    next(error);
  }
};

module.exports = { makePayment };
