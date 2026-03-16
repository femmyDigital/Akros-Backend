const mongoose = require("mongoose");

const DepositSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    amount: { type: Number, required: true },

    reference: { type: String, unique: true },

    transactionRef: {
      type: String,
    },

    email: { type: String },

    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },

    type: {
      type: String,
      enum: ["transfer", "card", "internal"],
    },

    txHash: String,
    expiresAt: Date,
  },
  { timestamps: true },
);

const Deposit = mongoose.model("Deposit", DepositSchema);
module.exports = Deposit;
