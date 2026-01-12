const Razorpay = require("razorpay");
const crypto = require("crypto");
const User = require("../models/User");
const Employer = require("../models/Employer");
const Payment = require("../models/premium");

require("dotenv").config();

// ✅ Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ✅ Create Razorpay order
exports.createOrder = async (req, res) => {
  try {
    const { plan, duration } = req.body;

    if (!plan || !duration) {
      return res.status(400).json({ status: false, msg: "Missing fields" });
    }

    const prices = {
      pro: { month: 39900, year: 399900 }, // ₹399 / ₹3999
      gold: { month: 89900, year: 699900 }, // ₹899 / ₹6999
    };

    if (!prices[plan] || !prices[plan][duration]) {
      return res
        .status(400)
        .json({ status: false, msg: "Invalid plan or duration" });
    }

    const amount = prices[plan][duration];

    const options = {
      amount,
      currency: "INR",
      receipt: `rcpt_${Math.floor(Math.random() * 1000000)}`,
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      status: true,
      order,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Order error:", error);
    res.status(500).json({ status: false, msg: "Order creation failed" });
  }
};

// ✅ Verify payment (for both user types)
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      plan,
      duration,
    } = req.body;

    const userId = req.user?.id;
    const role = req.user?.role; //  from token (user or employer)

    if (!userId || !role) {
      return res.status(401).json({ status: false, msg: "Unauthorized user" });
    }

    // ✅ Verify signature
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ status: false, msg: "Invalid signature" });
    }

    // ✅ Record payment
    const payment = await Payment.create({
      user: userId,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      plan,
      duration,
      amount:
        plan === "pro"
          ? duration === "month"
            ? 399
            : 3999
          : duration === "month"
          ? 899
          : 6999,
      status: "paid",
      role, // 🟢 store who paid (user or employer)
    });

    // ✅ Find & update the correct model
    const Model = role === "employ" ? Employer : User;
    const account = await Model.findById(userId);

    if (!account) {
      return res.status(404).json({ status: false, msg: `${role} not found` });
    }

    const now = new Date();
    const expiry =
      duration === "month"
        ? new Date(now.setMonth(now.getMonth() + 1))
        : new Date(now.setFullYear(now.getFullYear() + 1));

    account.isPremium = true;
    account.premiumPlan = plan;
    account.premiumActivatedOn = new Date();
    account.premiumExpiry = expiry;
    account.payments.push(payment._id);
    await account.save();

    res.status(200).json({
      status: true,
      msg: `${role} plan activated successfully`,
      plan: account.premiumPlan,
      expiresOn: account.premiumExpiry,
    });
  } catch (err) {
    console.error("Verify payment error:", err);
    res.status(500).json({ status: false, msg: "Server error" });
  }
};

// ✅ Get Premium Status
exports.getPremiumStatus = async (req, res) => {
  try {
    const { id, role } = req.user;
    const Model = role === "employ" ? Employer : User;

    const account = await Model.findById(id);
    if (!account)
      return res.status(404).json({ status: false, msg: `${role} not found` });

    // Auto-expire check
    if (account.premiumExpiry && new Date() > account.premiumExpiry) {
      account.isPremium = false;
      account.premiumPlan = null;
      account.premiumActivatedOn = null;
      account.premiumExpiry = null;
      await account.save();
    }

    res.status(200).json({
      status: true,
      isPremium: account.isPremium,
      premiumPlan: account.premiumPlan,
      premiumExpiry: account.premiumExpiry,
    });
  } catch (err) {
    res.status(500).json({ status: false, msg: "Server error" });
  }
};

// ✅ Cancel Premium
exports.cancelPremium = async (req, res) => {
  try {
    const { id, role } = req.user;
    const Model = role === "employ" ? Employer : User;

    const account = await Model.findById(id);
    if (!account || !account.isPremium)
      return res.status(400).json({ status: false, msg: "No active plan" });

    account.isPremium = false;
    account.premiumPlan = null;
    account.premiumActivatedOn = null;
    account.premiumExpiry = null;
    await account.save();

    res.status(200).json({ status: true, msg: `${role} premium cancelled` });
  } catch (err) {
    res.status(500).json({ status: false, msg: "Server error" });
  }
};

exports.resumecounte = async (req, res) => {
  try {
    const userId = req.user.id; // from token
    const user = await User.findByIdAndUpdate(
      userId,
      { $inc: { resumeCount: 1 } },
      { new: true }
    );
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.status(200).json({
      success: true,
      message: "Resume count increased",
      resumeCount: user.resumeCount,
    });
  } catch (error) {
    console.error("Error increasing resume:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


exports.createOrExportResume = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // === Restriction ===
    if (!user.isPremium && user.resumeCount >= 1) {
      return res.status(403).json({
        success: false,
        message: "Free users can only create one resume. Upgrade to premium for more.",
      });
    }

    // If allowed, increase resume count
    user.resumeCount += 1;
    await user.save();

    res.json({
      success: true,
      message: "Resume created/exported successfully.",
      resumeCount: user.resumeCount,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};




exports.pagination =async(req,res)=>{
  try {
    // const page = parseInt(req.query.) 
    const limit = parseInt(req.query.limit)

    const total = await User.countDocuments();

    res.json({
      success: true,
      page,
      limit,
      total,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}



