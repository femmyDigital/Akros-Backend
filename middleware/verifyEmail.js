const isVerifiedEmail = (req, res, next) => {
  try {
    if (!req.user.verified) {
      const error = new Error("Please verify your email to continue");
      error.statusCode = 403;
      throw error;
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
  next();
};

module.exports = { isVerifiedEmail };
