const express = require("express");
const router = express.Router();

const {
  createOrder,
  verifyPayment,
  getPremiumStatus,
  cancelPremium,
  resumecounte,
  createOrExportResume,
} = require("../controllers/premiumController");
const { protect } = require("../middleware/authMiddleware");


// Protected routes 
router.post("/createprime", protect, createOrder);
router.post("/verify", protect, verifyPayment);
router.get("/status", protect, getPremiumStatus);
router.post("/cancel", protect, cancelPremium);
router.post("/resumecounte", protect, resumecounte);
router.post("/createOrExportResume", protect, createOrExportResume);


module.exports = router;
