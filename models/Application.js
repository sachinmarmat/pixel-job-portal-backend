const mongoose = require('mongoose');
// require('./ser');

const applicationSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Jobs', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  name: { type: String },
  email: { type: String },
  resume: { type: String, required: true },
  resumePublicId: { type: String },
  coverLetter: { type: String },
  status: {
    type: String,
    enum: ["pending", "reviewed", "accepted", "rejected"],
    default: "pending"
  }
}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema);
