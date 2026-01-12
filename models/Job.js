const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    title: { type: String, required: true, index: true },
    company: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    location: { type: String, required: true, index: true },
    date: { type: Date  },
    salary: { type: Number, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employer', required: true },
    applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' , default: []}],
    status:{
        type:String,
        enum:["active", "closed"], 
        default:"active"
    }

}, { timestamps: true }); 
 
module.exports = mongoose.model('Jobs', jobSchema) 
 