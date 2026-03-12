const mongoose = require("mongoose");

const purchaseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    network: {
      type: String,
      enum: ["MTN", "GLO", "AIRTEL", "9MOBILE"],
      required: true,
    },

    phoneNumber: { type: String, required: true },

    type: { type: String, enum: ["AIRTIME", "DATA"], required: true },

    amount: { type: Number, required: true },

    planCode: { type: String },

    provider: { type: String, default: "" },

    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED"],
      default: "PENDING",
    },

    externalReference: { type: String },

    meta: Object,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Purchase", purchaseSchema);
