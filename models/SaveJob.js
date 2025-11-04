const mongoose = require('mongoose');
// require('./ser');

const applicationSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Jobs', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema);
