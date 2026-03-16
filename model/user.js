const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    phone: {
      type: Number,
      required: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
      required: true,
    },

    accountNumber: {
      type: String,
      // required: true
    },
    bankName: {
      type: String,
      //  required: true
    },

    verifyEmailToken: String,
    verifyEmailTokenExpires: Date,

    resetPasswordToken: String,
    resetPasswordExpires: Date,

    verified: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const User = mongoose.model("User", UserSchema);
module.exports = User;
