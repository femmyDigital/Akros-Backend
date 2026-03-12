const mongoose = require("mongoose");

const webhookLogSchema = new mongoose.Schema(
  {
    provider: { type: String, default: "MONNIFY" },

    event: { type: String },

    payload: { type: Object },

    signature: { type: String },

    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("WebhookLog", webhookLogSchema);
