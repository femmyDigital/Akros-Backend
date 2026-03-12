// models/VirtualAccount.js
const mongoose = require("mongoose");

const VirtualAccountSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    accountNumber: { type: String, required: true },

    bankName: { type: String, required: true },

    accountReference: { type: String, required: true, unique: true },

    provider: { type: String, default: "MONNIFY" },

    status: { type: String, enum: ["ACTIVE", "INACTIVE"], default: "ACTIVE" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("VirtualAccount", VirtualAccountSchema);
