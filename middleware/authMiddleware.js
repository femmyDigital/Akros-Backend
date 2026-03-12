const User = require("../model/user");
const jwt = require("jsonwebtoken");

const protect = async (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (!token)
      return res
        .status(401)
        .json({ message: "No token provided. Access denied." });

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err)
        return res.status(401).json({ message: "Invalid or expired token" });

      // Fetch user from decoded token
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) return res.status(404).json({ message: "User not found" });

      next();
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
    next(error);
  }
};

const isAdmin = async (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (!token)
      return res
        .status(401)
        .json({ message: "No token provided. Access denied." });

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err)
        return res.status(401).json({ message: "Invalid or expired token" });

      // Fetch user from decoded token
      req.user = await User.findById(decoded.id).select("-password");

      if (req.user.role !== "admin")
        return res.status(404).json({ message: "User not an Admin" });

      next();
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
    next(error);
  }
};

module.exports = { protect, isAdmin };
