const axios = require("axios");

async function createVirtualAccount(user) {
  const response = await axios.post(
    "https://strowallet.com/api/virtual-account",
    {
      name: user.name,
      email: user.email,
      phone: user.phone,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.STROWALLET_SECRET}`,
      },
    },
  );

  return response.data;
}

module.exports = { createVirtualAccount };
