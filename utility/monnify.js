const axios = require("axios");
const dotenv = require("dotenv");
const crypto = require("crypto");

dotenv.config();

const {
  MONNIFY_API_KEY,
  MONNIFY_SECRET_KEY,
  MONNIFY_CONTRACT_CODE,
  MONNIFY_BASE_URL,
} = process.env;

// Cache token in memory
let cachedToken = null;
let tokenExpiry = null;

export async function getAccessToken() {
  try {
    // If token exists and not expired → use it
    if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
      return cachedToken;
    }

    const auth = Buffer.from(
      `${MONNIFY_API_KEY}:${MONNIFY_SECRET_KEY}`,
    ).toString("base64");

    console.log({
      MONNIFY_API_KEY,
      MONNIFY_SECRET_KEY,
      MONNIFY_CONTRACT_CODE,
      MONNIFY_BASE_URL,
      auth,
    });

    const response = await axios.post(
      `${MONNIFY_BASE_URL}/api/v1/auth/login`,
      {},
      {
        headers: {
          Authorization: `Basic ${auth}`, // ✅ Correct scheme
          "Content-Type": "application/json",
        },
      },
    );
    const { accessToken, expiresIn } = response.data.responseBody;

    console.log(accessToken);

    // Cache token
    cachedToken = accessToken;
    tokenExpiry = Date.now() + expiresIn * 1000;

    return accessToken;
  } catch (err) {
    console.error("Monnify Auth Error:", err.response?.data || err.message);
    throw new Error("Failed to authenticate with Monnify");
  }
}

export async function createReservedAccount({
  accountReference,
  accountName,
  customerEmail,
  customerName,
  bvn,
  nin,
  currencyCode,
  getAllAvailableBanks,
}) {
  try {
    const token = await getAccessToken();
    console.log("token", token);

    const payload = {
      accountReference,
      accountName,
      customerEmail,
      customerName,
      bvn,
      nin,
      currencyCode,
      contractCode: MONNIFY_CONTRACT_CODE,
      getAllAvailableBanks,
    };
    console.log("Using contract code:", MONNIFY_CONTRACT_CODE);

    // console.log("payload & token", payload, token);

    const response = await axios.post(
      `${MONNIFY_BASE_URL}/api/v2/bank-transfer/reserved-accounts`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    return response.data.responseBody;
  } catch (err) {
    console.error(
      "Create Reserved Account Error:",
      err.response?.data || err.message,
    );
    throw new Error("Failed to create virtual account");
  }
}

export async function verifyTransaction(transactionReference) {
  try {
    const token = await getAccessToken();

    const response = await axios.get(
      `${MONNIFY_BASE_URL}/api/v2/transactions/${transactionReference}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data.responseBody;
  } catch (err) {
    console.error(
      "Transaction Verification Error:",
      err.response?.data || err.message,
    );
    throw new Error("Failed to verify transaction");
  }
}

export function validateWebhook(req) {
  try {
    const signature = req.headers["monnify-signature"];
    const computedHash = crypto
      .createHmac("sha512", MONNIFY_SECRET_KEY)
      .update(JSON.stringify(req.body))
      .digest("hex");

    return signature === computedHash;
  } catch (err) {
    console.error("Webhook Validation Error:", err);
    return false;
  }
}
