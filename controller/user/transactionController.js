const Transaction = require("../../model/transaction");

const getUserTransactions = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const transactions = await Transaction.find({ user: userId }).sort({
      createdAt: -1,
    });

    res.status(201).json({
      success: true,
      message: "Transaction fetched successfully",
      data: transactions,
    });
    //
    //
  } catch (error) {
    console.log(error);
    next(error);
  }
};

module.exports = { getUserTransactions };
