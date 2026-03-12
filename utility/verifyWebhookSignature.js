const crypto = require("crypto");

function verifyMonnifySignature(payload, signature) {
  const secret = process.env.MONNIFY_WEBHOOK_SECRET;

  const expected = crypto
    .createHmac("sha512", secret)
    .update(JSON.stringify(payload))
    .digest("hex");

  return expected === signature;
}

module.exports = verifyMonnifySignature;
