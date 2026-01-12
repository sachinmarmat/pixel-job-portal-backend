const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Employer = require("../models/Employer");


// Sign access and refresh tokens
const signAccess = (user) => {
  // Ensure role is set properly
  const userRole = user.role || (user.constructor.modelName === 'user' ? 'jobseeker' : 'employer');
  return jwt.sign({ id: user._id, role: userRole }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.ACCESS_EXPIRES,
  });
}; 

const signRefresh = (user) =>
  jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.REFRESH_EXPIRES,
  });

// Generate both tokens and save refresh in DB
const setTokens = async (user) => {
  const accessToken = signAccess(user); 
  const refreshToken = signRefresh(user);

  user.refreshToken = refreshToken;
  await user.save();

  return { accessToken, refreshToken };
};

//  Protect route — JWT validation
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ status: false, msg: "Not authorized, no token" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    req.user = decoded;
    
    next();
  } catch (error) {
    console.error("Auth error:", error.message);
    return res.status(401).json({ status: false, msg: "Not authorized" });
  }
};

//  Role-based access
const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user)
      return res.status(401).json({ status: false, msg: "Not authorized" });
    if (!roles.includes(req.user.role))
      return res
        .status(403)
        .json({ status: false, msg: "Access denied: insufficient role" });

    next();
  };
};

//  NEW — Premium plan access control
const requirePremium = async (req, res, next) => {
  try {
    const user = req.user;
    // const user = await User.findById(req.user.id);

     if (!user)
      return res.status(401).json({ status: false, msg: "User not authorized" });

    // Refresh status (in case premium expired)
    if (user.premiumExpiry && new Date() > user.premiumExpiry) {
      user.isPremium = false; 
      user.premiumPlan = null;
      user.premiumActivatedOn = null;
      user.premiumExpiry = null;
      await user.save();
    }

    if (!user.isPremium) {
      return res.status(403).json({
        status: false,
        msg: "Premium plan required to access this feature",
      });
    }
    req.user = user; // attach full user for controller use

    next();
  } catch (err) {
    console.error("Premium check error:", err.message);
    res.status(500).json({ status: false, msg: "Server error" });
  }
};

module.exports = {
  setTokens,
  signAccess,
  signRefresh,
  protect,
  allowRoles,
  requirePremium, //  export new middleware
};
