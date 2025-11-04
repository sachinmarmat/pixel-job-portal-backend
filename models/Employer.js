const mongoose = require('mongoose');

const employerSchema = new mongoose.Schema({
  // name: { 
  //   type:String,
  //   required: true,
  //   unique: true 
  // },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  password: { type: String, required: true },
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

  // website: { type: String, trim: true },
  // address: { type: String, trim: true },
  // status: { 
  //   type: String, 
  //   enum: ["suspend", "approved", "rejected"],  
  //   default: "pending" 
  // }
}, { timestamps: true });

module.exports = mongoose.model('Employer', employerSchema);
