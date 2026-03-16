const mongoose = require("mongoose");

const AccountSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      required: true,
    },

    accountNumber: { type: String, required: true },
    bankName: { type: String, required: true },
    accountReference: { type: String, required: true, unique: true },
    status: { type: String, enum: ["ACTIVE", "INACTIVE"], default: "ACTIVE" },

    balance: {
      type: Number,
      default: 0,
    },

    currency: {
      type: String,
      default: "NGN",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Account", AccountSchema);
