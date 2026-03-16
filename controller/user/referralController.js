const Transaction = require("../../model/transaction");
const Referral = require("../../model/referral");
const Account = require("../../model/account");

const handleReferralRegistration = async (referralCode, newUserId, amount) => {
  const REFERRAL_REWARD = Math.floor(amount * 0.2);
  try {
    const referral = await Referral.findOne({ referralCode });

    if (!referral) return;

    const referrerId = referral.user;

    // Prevent self-referral
    if (referrerId.toString() === newUserId.toString()) return;

    //  UPDATE REFERRAL STRUCTURE
    referral.referredUsers.push(newUserId);
    referral.earnings += REFERRAL_REWARD;
    await referral.save();

    // UPDATE REFERRER Account
    let account = await Account.findOne({ user: referrerId });
    if (!account) {
      account = await Account.create({
        user: referrerId,
        balance: 0,
        totalEarned: 0,
      });
    }

    account.balance += REFERRAL_REWARD;
    account.totalEarned += REFERRAL_REWARD;
    await account.save();

    //  CREATE TRANSACTION RECORD
    await Transaction.create({
      user: referrerId,
      type: "referral",
      amount: REFERRAL_REWARD,
      description: "Referral bonus for inviting a new user",
      status: "success",
    });

    console.log("Referral bonus added successfully");
  } catch (error) {
    console.log(error);
  }
};

const getReferralStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const referral = await Referral.findOne({ user: userId }).populate(
      "referredUsers",
      "name email createdAt referralCode",
    );

    const referralHistory = await Transaction.find({
      user: id,
      type: "referral",
    });

    const total = referralHistory.reduce((acc, tx) => acc + tx.amount, 0);

    if (!referral) {
      return res.status(201).json({
        success: false,
        referralCode: null,
        totalReferrals: 0,
        earnings: 0,
        referredUsers: [],
      });
    }

    res.status(201).json({
      success: true,
      message: "Referral Stat fetched successfully",
      data: { ...referral, totalRefEarning: total },
    });

    //
    //
  } catch (error) {
    console.log(error);
    next(error);
  }
};

module.exports = {
  handleReferralRegistration,
  getReferralStats,
};
