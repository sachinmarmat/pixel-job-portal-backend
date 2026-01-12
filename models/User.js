const mongoose = require("mongoose");

const educationSchema = new mongoose.Schema({
  degree: { type: String, trim: true },
  institute: { type: String, trim: true },
  start: { type: String, trim: true },
  end: { type: String, trim: true },
});
const experienceSchema = new mongoose.Schema({
  title: { type: String, trim: true },
  company: { type: String, trim: true },
  start: { type: String, trim: true },
  end: { type: String, trim: true },
  details: { type: String, trim: true },
  currentlyWorking: { type: Boolean, trim: true },
});

const projectSchema = new mongoose.Schema({
  title: { type: String, trim: true },
  description: { type: String, trim: true },
  link: { type: String, trim: true },
});

const userSchema = new mongoose.Schema(
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
    address: { type: String, trim: true },
    phone: { type: Number, trim: true },
    website: { type: String, trim: true },
    education: [educationSchema],
    projects: [projectSchema],
    experience: [experienceSchema],

    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["jobseeker", "admin"],
      default: "jobseeker",
    },
    savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Jobs" }],

    company: { type: String, trim: true },
    phone: { type: String, trim: true },
    currentRole: { type: String,  trim: true },
    experienceYears: { type: String, trim: true },
    currentSalary: { type: String, trim: true },
    expectedSalary: { type: String, trim: true },
    skills: [{ type: String, trim: true }],
    languages: [{ type: String, trim: true }],
    summary: { type: String, trim: true },

    // ✅ Account status
    status: { type: String, enum: ["active", "suspended"], default: "active" },
    suspendedUntil: { type: Date, default: null },
    suspensionReason: { type: String, default: null },
    refreshToken: { type: String },
    isVerified: { type: Boolean, default: false },

    //  Premium Plan setup
    isPremium: { type: Boolean, default: false },
    premiumPlan: {
      type: String,
      enum: ["basic", "pro", "gold", null],
      default: null,
    },
    premiumActivatedOn: { type: Date },
    premiumExpiry: { type: Date },

    //  Optional: track how many resumes user built
    resumeCount: { type: Number, default: 0 },
    payments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Payment" }],
  },
  { timestamps: true }
);

//  Helper method to auto-disable expired premium plans
userSchema.methods.checkPremiumStatus = async function () {
  if (this.isPremium && this.premiumExpiry && new Date() > this.premiumExpiry) {
    this.isPremium = false;
    this.premiumPlan = null;
    this.premiumActivatedOn = null;
    this.premiumExpiry = null;
    await this.save();
  }
  return this.isPremium;
};

module.exports = mongoose.model("user", userSchema);
