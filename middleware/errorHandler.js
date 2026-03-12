const handleCastErrorDB = (err, res) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  res.status(400).json({
    success: false,
    message: message,
  });
};

const handleDuplicateDB = (err, res) => {
  // const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const value = Object.values(err.keyValue);
  const message = `Duplicate field value ${value}. Please use another value`;
  res.status(400).json({
    success: false,
    message: message,
  });
};

const handleValidationErrorDB = (err, res) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data ${errors.join(". ")}`;
  res.status(400).json({
    success: false,
    message: message,
  });
};

const handleJWTError = () => {
  res.status(401).json({
    success: false,
    message: "Invalid Token, Please Login again",
  });
};

const handleJWTExpiredError = () => {
  res.status(401).json({
    success: false,
    message: "Your Token has expired, Please Login again",
  });
};

const networkError = (err, res) => {
  res.status(500).json({
    success: false,
    message: "Check your internet connection and Try again!",
  });
};

const MongooseError = (err, res) => {
  res.status(500).json({
    success: false,
    message: "Check your internet connection and Try again!",
  });
};

//
//
//
//
//

const sendError = (err, req, res) => {
  //Api

  if (req.originalUrl.startsWith("/api")) {
    //operational
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    console.error("Error 🔥🚨", err);
    return res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }

  //rendered
  if (err.isOperational) {
    return res.status(err.statusCode).render("error", {
      title: "Something went wrong",
      msg: err.message,
    });
  }
  console.error("Error 🔥🚨", err);

  // 2)
  return res.status(err.statusCode).render("error", {
    title: "Something went wrong",
    msg: "Please try again later",
  });
};

//
//
//
//
const errorHandler = (err, req, res, next) => {
  console.error("Error is:", err.message);
  console.error("Error name:", err.name);
  console.error("Error:", err);
  const statusCode = err.statusCode || 500;

  // res.status(statusCode).json({
  //   success: false,
  //   message: err.message || "Internal Server Error",
  // });
  // let error = { ...err };
  // error.message = err.message;

  if (err.name === "CastError") err = handleCastErrorDB(err, res);
  if (err.code === 11000) err = handleDuplicateDB(err, res);
  if (err.name === "MongoServerSelectionError") err = networkError(err, res);
  if (err.code === "ENOTFOUND") err = networkError(err, res);
  if (err.name === "JsonWebTokenError") err = handleJWTError();
  if (err.name === "TokenExpiredError") err = handleJWTExpiredError();
  if (err.name === "MongooseError") err = MongooseError(err, res);
  if (err.name === "ValidationError") err = handleValidationErrorDB(err, res);

  res.status(500).json({
    success: false,
    message: err?.message,
  });
};

module.exports = errorHandler;
