const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      required: true,
    },

    type: {
      type: String,
      enum: ["credit", "debit", "refund", "referral", "bonus"],
    },

    amount: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["pending", "success", "failed"],
    },

    provider: {
      type: String,
      default: "",
    },

    accountReference: { type: String },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Transaction", TransactionSchema);
