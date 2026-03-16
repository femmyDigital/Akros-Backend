const express = require("express");
require("dotenv").config();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const errorHandler = require("./middleware/errorHandler");

//Auth
const authRouter = require("./route/auth/authRoute");

//Admin
const adminRoute = require("./route/admin/adminRoute");

//User
// const walletRouter = require("./route/user/walletRoute");
const paymentRouter = require("./route/user/paymentRoute");
const purchaseRouter = require("./route/user/purchaseRoute");

mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => console.log("Database Connected"))
  .catch((error) => console.log(error));

const app = express();
const PORT = process.env.PORT || 3002;

app.use(
  cors({
    origin: [process.env.CLIENT_URL, "https://akros-frontend.vercel.app"],
    methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
    allowedHeaders: [
      "content-Type",
      "Authorization",
      "Cache-Control",
      "Expires",
      "Pragma",
    ],
    credentials: true,
  }),
);

app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.json());

//Auth
app.use("/api/v1/auth", authRouter);

//Admin
app.use("/api/v1/adminCreditWallet", adminRoute);

//User
// app.use("/api/v1/wallet", walletRouter);
app.use("/api/v1/purchase", purchaseRouter);
app.use("/api/v1/payment", paymentRouter);

//Common

app.use(errorHandler);

app.listen(PORT, () => {
  console.log("Server is running");
});
