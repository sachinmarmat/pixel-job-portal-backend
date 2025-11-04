const jwt = require("jsonwebtoken");
const User = require("../models/User");

// sign tokens-----------------------------
const signAccess = (user) => jwt.sign({ id: user._id, role: user.role }, process.env.JWT_ACCESS_SECRET, { expiresIn: process.env.ACCESS_EXPIRES });

const signRefresh = (user) => jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.REFRESH_EXPIRES });

// token generate-----------------------------------------
const setTokens = async (user) => {
    const accessToken = signAccess(user);
    const refreshToken = signRefresh(user);   

    user.refreshToken = refreshToken; 
    await user.save();

    return { accessToken, refreshToken };
};


const protect = (req, res, next) => {
    try {
        const authHeader = req.headers["authorization"];
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ status: false, msg: "Not authorized, no token" });
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



const allowRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user) return res.status(401).json({ status: false, msg: "Not authorized" });
        if (!roles.includes(req.user.role)) return res.status(403).json({ status: false, msg: "Access denied: insufficient role" });

        next()
    }
}


module.exports = { setTokens, signAccess, signRefresh, protect, allowRoles };
