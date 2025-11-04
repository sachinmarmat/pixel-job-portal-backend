const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true,  index:true},
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["jobseeker", "admin"],
    default: "jobseeker",
  },
  savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Jobs" }],
  status: { type: String, enum: ["active", "suspended"], default: "active" },
  suspendedUntil: { type: Date, default: null },
  suspensionReason: { type: String, default: null },
  refreshToken: { type: String },
   isVerified: { type: Boolean, default: false },

}, { timestamps: true });

module.exports = mongoose.model('user', userSchema)