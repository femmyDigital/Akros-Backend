const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nanoid = (...args) =>
  import("nanoid").then(({ nanoid }) => nanoid(...args));
require("dotenv").config();
const crypto = require("crypto");
const User = require("../../model/user");
const Account = require("../../model/account");
const { createVirtualAccount } = require("../../helpers/strowallet");

const signupUser = async (req, res, next) => {
  const { name, email, phone, referralCode, password } = req.body;

  try {
    const checkUser = await User.findOne({ email });

    if (checkUser) {
      const error = new Error("User Already Exist with that email");
      error.statusCode = 404;
      throw error;
    }

    const hashPassword = await bcrypt.hash(password, 12);
    const myReferralCode = nanoid(8);

    const newUser = await User.create({
      name,
      email,
      phone,
      referralCode: myReferralCode,
      referredBy: referralCode || null,
      password: hashPassword,
      verified: false,
      verifyEmailToken: hashedToken,
      verifyEmailTokenExpires: Date.now() + 10 * 60 * 1000,
    });

    const virtualAccount = await createVirtualAccount(newUser);

    await Wallet.create({
      user: newUser._id,
      balance: 0,
      accountNumber: virtualAccount.number,
      accountName: virtualAccount.name,
      referralEarnings: 0,
      totalDeposits: 0,
      totalWithdrawals: 0,
    });

    await Referral.create({
      user: newUser._id,
      referralCode: myReferralCode,
      referredBy: referralCode || null,
    });

    res.status(200).json({
      success: true,
      message: "Registration Successful",
    });

    //
    //
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const checkUser = await User.findOne({ email });

    if (!checkUser) {
      const error = new Error("User Doesn't Exist, Please Register ");
      error.statusCode = 404;
      throw error;
    }

    const checkPasswordMatch = await bcrypt.compare(
      password,
      checkUser.password,
    );

    if (!checkPasswordMatch) {
      const error = new Error("Incorrect Password! Please try again");
      error.statusCode = 401;
      throw error;
    }

    const age = 1000 * 60 * 60 * 24 * 7;

    const token = jwt.sign(
      {
        id: checkUser._id,
        email: checkUser.email,
        role: checkUser.role,
        name: checkUser.name,
        phone: checkUser.phone,
        verified: checkUser.verified,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: age },
    );

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: age,
      })
      .status(200)
      .json({
        success: true,
        message: "Logged In Successfully",
        user: {
          id: checkUser._id,
          email: checkUser.email,
          role: checkUser.role,
          name: checkUser.name,
          phone: checkUser.phone,
          verified: checkUser.verified,
        },
      });

    //
    //
  } catch (error) {
    next(error);
  }
};

const logoutUser = (req, res) => {
  res
    .clearCookie("token", {
      httpOnly: true,
      // secure: true,
      // sameSite: "none",
    })
    .json({
      success: true,
      message: "Logged Out Successfully",
    });
};

//
//Auth
//
const authMiddleware = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token)
    return res.status(401).json({
      success: false,
      message: "Unauthorized User",
    });

  try {
    const decode = jwt.verify(token, process.env.JWT_SECRET_KEY);

    req.user = decode;
    next();
  } catch (error) {
    console.log(error);
    res.status(403).json({
      success: false,
      message: "Token not valid",
    });
  }
};

//
//Forget Password
//
const forgetPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      const error = new Error("User Doesn't Exist. Please Register");
      error.statusCode = 404;
      throw error;
    }

    const token = crypto.randomBytes(20).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 mins
    await user.save();

    const resetURL = `${process.env.CLIENT_URL}/verify/confirmPassword/${token}`;

    await sendEmail(
      user.email,
      "Password Reset",
      `<h2>Reset Your Password</h2>
    <p>Please click the link below to reset your password:</p>
    <a href="${resetURL}">Reset Password</a>
    <p>This link expires in 10 minutes.</p>`,
    );

    res.status(200).json({
      success: true,
      message: "Reset link sent to your email",
    });
    //
    //
  } catch (error) {
    console.log(error);
    next(error);
  }
};

//
//confirmPassword
//
const confirmPassword = async (req, res, next) => {
  try {
    const { password, confirmPassword, token } = req.body;

    if (password !== confirmPassword) {
      const error = new Error("Passwords does not match, Try again");
      error.statusCode = 404;
      throw error;
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const hashPassword = await bcrypt.hash(password, 12);

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      const error = new Error("User does not exist!");
      error.statusCode = 404;
      throw error;
    }

    user.password = hashPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

//
//changePassword
//
const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, password, confirmPassword } = req.body;
    const { userId } = req.params;

    console.log(userId, oldPassword, password, confirmPassword);

    const checkUser = await User.findById(userId);

    if (!checkUser) {
      const error = new Error("User Doesn't Exist. Please Register");
      error.statusCode = 404;
      throw error;
    }

    const checkPasswordMatch = await bcrypt.compare(
      oldPassword,
      checkUser.password,
    );

    if (!checkPasswordMatch) {
      const error = new Error();
      error.statusCode = 401;
      error.message = "Incorrect Password! Please try again";
      throw error;
    }

    if (password !== confirmPassword) {
      const error = new Error("Passwords does not match, Try again");
      error.statusCode = 404;
      throw error;
    }

    const hashPassword = await bcrypt.hash(password, 12);

    checkUser.password = hashPassword;
    await checkUser.save();

    res.status(200).json({
      success: true,
      message: " Password changed successful",
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// Resend
const resendEmailVerification = async (req, res, next) => {
  try {
    const { tokenId } = req.params;

    const user = await User.findById(tokenId);

    if (user.verified)
      return res.json({ message: "Email is already verified" });

    const token = crypto.randomBytes(20).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    user.verifyEmailToken = hashedToken;
    user.verifyEmailTokenExpires = Date.now() + 10 * 60 * 1000; // 10 mins

    await user.save();

    const resetURL = `${process.env.CLIENT_URL}/verify/verifyEmail/${token}`;

    await sendEmail(
      user.email,
      "Verify Email Link",
      `<h2>Verify Your Email</h2>
    <p>Please click the link below to verify your account:</p>
    <a href="${resetURL}">Verify Email</a>
    <p>This link expires in 10 minutes.</p>`,
    );

    res.status(200).json({
      success: true,
      message: "Email link sent to your email",
    });

    res.json({ message: "Verification email sent again!" });
  } catch (error) {
    next(error);
  }
};

//
//Send VerifyEmailLink
const sendVerifyEmailLink = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      const error = new Error("User Doesn't Exist. Please Register");
      error.statusCode = 404;
      throw error;
    }

    const token = crypto.randomBytes(20).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    user.verifyEmailToken = hashedToken;
    user.verifyEmailTokenExpires = Date.now() + 10 * 60 * 1000; // 10 mins
    await user.save();

    const resetURL = `${process.env.CLIENT_URL}/verify/verifyEmail/${token}`;

    await sendEmail(
      email,
      "Verify Email Link",
      `<h2>Verify Your Email</h2>
    <p>Please click the link below to verify your account:</p>
    <a href="${resetURL}">Verify Email</a>
    <p>This link expires in 10 minutes.</p>`,
    );

    res.status(200).json({
      success: true,
      message: "Verification link sent to your email",
    });
    //
    //
  } catch (error) {
    console.log(error);
    next(error);
  }
};

//
//VerifyEmail
const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      verifyEmailToken: hashedToken,
      verifyEmailTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      const error = new Error("User does not exist!");
      error.statusCode = 404;
      throw error;
    }

    user.verifyEmailToken = undefined;
    user.verifyEmailTokenExpires = undefined;
    user.verified = true;

    await user.save();

    res.status(200).json({
      success: true,
      message: "User Verified Successful",
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

module.exports = {
  signupUser,
  loginUser,
  logoutUser,
  authMiddleware,
  forgetPassword,
  confirmPassword,
  changePassword,
  resendEmailVerification,
  sendVerifyEmailLink,
  verifyEmail,
};
