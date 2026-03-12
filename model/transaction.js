const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      required: true,
    },

    type: {
      type: String,
      enum: ["fund", "debit", "refund"],
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
      default: "Monnify",
    },

    providerReference: {
      type: String,
      index: true,
    },

    accountReference: { type: String },

    meta: { type: Object },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", TransactionSchema);
