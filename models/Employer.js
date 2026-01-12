const mongoose = require("mongoose");

const employerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    website: { type: String, trim: true },
    about: { type: String, trim: true },
    founded: { type: String, trim: true },
    companysize: { type: String, trim: true },
    service:[ { type: String, trim: true }],
    other: [{ type: String, trim: true }],
    password: { type: String, required: true },
    phone: { type: Number, trim: true },
    address: { type: String, trim: true },
    role: {
      type: String,
      enum: ["employ"],
      default: "employ",
    },
    refreshToken: { type: String },
    isVerified: { type: Boolean, default: false },
    status: { type: String, enum: ["active", "suspended"], default: "active" },
    suspendedUntil: { type: Date, default: null },
    suspensionReason: { type: String, default: null },

    // 🔥 Premium plan fields
    isPremium: { type: Boolean, default: false },
    premiumPlan: {
      type: String,
      enum: ["basic", "pro", "gold", null],
      default: null,
    },
    premiumActivatedOn: { type: Date, default: null },
    premiumExpiry: { type: Date, default: null },

    // Optional tracking fields
    resumeCount: { type: Number, default: 0 },
    payments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Payment" }],
  },
  { timestamps: true }
);

// ✅ Helper method to auto-disable expired premium plans
employerSchema.methods.checkPremiumStatus = async function () {
  if (this.isPremium && this.premiumExpiry && new Date() > this.premiumExpiry) {
    this.isPremium = false;
    this.premiumPlan = null;
    this.premiumActivatedOn = null;
    this.premiumExpiry = null;
    await this.save();
  }
  return this.isPremium;
};

module.exports = mongoose.model("Employer", employerSchema);
