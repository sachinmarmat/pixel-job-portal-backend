const { json } = require("express");
// const Job = require('../models/Job');
const JobModel = require("../models/Job");
const Application = require("../models/Application");
const User = require("../models/User");
const { default: mongoose } = require("mongoose");
// const Job = require('../models/Job');

// ------------------------create a job---------------------
exports.createJob = async (req, res) => {
  try {
    const { title, company, date, description, location, salary } = req.body;

    const job = new JobModel({
      title,
      company,
      description,
      location,
      date,
      salary,
      createdBy: req.user.id,
    });

    await job.save();
    res.status(201).json({ status: true, msg: "Job created", job });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: false, msg: "Server error", error: error.message });
  }
};

// -----------get all jobs------------------------
exports.getAllJobs = async (req, res) => {
  try {
    const alljobs = await JobModel.find({});

    if (!alljobs) return res.json({ status: false, msg: "no jobs available" });

    res.json({
      status: true,
      msg: "All jobs fetched ",
      jobs: alljobs,
    });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({ status: false, msg: "Server error" });
  }
};

// ---------------------------get job by id----------------------------
exports.getJobsbyId = async (req, res) => {
  try {
    const { id } = req.params; // e.g. /api/jobs/12345

    const getjob = await JobModel.find({ createdBy: id }).sort({
      createdAt: -1,
    });
    // console.log(getjob)

    if (!getjob) {
      return res.json({ status: false, msg: "No job found" });
    }

    res.json({
      status: true,
      msg: "Job fetched successfully",
      job: getjob,
    });
  } catch (error) {
    console.error("Error fetching job:", error);
    res.status(500).json({ status: false, msg: "Server error" });
  }
};

// -------------------------update a job ---------------------
exports.updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("hello");
    const updates = req.body;

    const updatedJob = await JobModel.findOneAndUpdate(
      { _id: id, createdBy: req.user.id },
      updates,
      { new: true, runValidators: true, lean: true }
    );

    if (!updatedJob) {
      return res
        .status(404)
        .json({ status: false, msg: "Job not found or not authorized" });
    }

    res.json({ status: true, msg: "Job updated", job: updatedJob });
  } catch (error) {
    console.error("Error updating job:", error);
    res.status(500).json({ status: false, msg: "Server error" });
  }
};

// ----------------------------delete a job------------------------------
exports.deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);

    let filter = { _id: id };

    if (req.user.role === "employ") {
      filter.createdBy = req.user.id;
    }

    console.log(req.user.id);

    const deletedJob = await JobModel.findOneAndDelete(filter);

    if (!deletedJob) {
      return res.status(404).json({
        status: false,
        msg: "Job not found or not authorized to delete",
      });
    }

    res.json({
      status: true,
      msg: "Job deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting job:", error);
    res.status(500).json({ status: false, msg: "Server error" });
  }
};

// ----------------------apply to job-------------------
// exports.applyJob = async (req,res) => {
//   try {

//     const jobid = req.params.id;

//     const job = await JobModel.findById(jobid)

//     if (!job) return res.status(404).json({ status: false, msg: 'job not found' })

//     if (job.applicants.includes(req.user.id)) return res.status(400).json({ status: false, msg: 'already applied to this job' })

//     job.applicants.push(req.user.id);
//     await job.save()

//     res.status(200).json({
//       status: true,
//       msg: "Applied successfully",
//       job
//     });
//   } catch (error) {
//     console.error("Error applying job:", error);
//     res.status(500).json({ status: false, msg: "Server error" });
//   }
// };

// exports.applyJob = async (req, res) => {
//   try {
//     const jobId = req.params.id;
//     const { name, email, resume, coverLetter } = req.body;
//     const userId = req.user.id;

//     console.log(userId, jobId)

//     const existingApp = await Application.findOne({ job: jobId, user: userId });
//     if (existingApp) {
//       return res.status(400).json({ message: "You already applied for this job" });
//     }

//     const application = new Application({
//       job: jobId,
//       user: userId,
//       name,
//       email,
//       resume,
//       coverLetter
//     });

//     await application.save();

//     res.status(201).json({ message: "Application submitted", application });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// --------------------------appply for job-------------------

// exports.applyJob = async (req, res) => {
//   try {
//     const jobId = req.params.id;
//     const userId = req.user.id;
//     const { name, email, coverLetter } = req.body;

//     // 🔍 If no file uploaded
//     if (!req.file) {
//       return res.status(400).json({ message: "Resume file is required" });
//     }

//     // ✅ Cloudinary stores the file and multer gives us this:
//     const resumeUrl = req.file.path; // Cloudinary public URL
//     const resumePublicId = req.file.filename; // Cloudinary public_id (optional to save for deletion later)

//     //  Check if job exists
//     const job = await JobModel.findById(jobId);
//     if (!job) {
//       return res.status(404).json({ message: "Job not found" });
//     }

//     //  Check duplicate application
//     const existingApp = await Application.findOne({ job: jobId, user: userId });
//     if (existingApp) {
//       return res.status(400).json({ message: "You already applied for this job" });
//     }

//     // ✅ Create new application
//     const application = new Application({
//       job: jobId,
//       user: userId,
//       name,
//       email,
//       coverLetter,
//       resume: resumeUrl, // Cloudinary URL
//       resumePublicId, // optional, helps with later deletion
//     });

//     await application.save();

//     res.status(201).json({
//       message: "Application submitted successfully",
//       application,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Error applying for job", error: err.message });
//   }
// };

// const Application = require('../models/Application');
// const JobModel = require('../models/Jobs');

exports.applyJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const userId = req.user.id;
    const { name, email, coverLetter } = req.body;

    //  If no file uploaded
    if (!req.file) {
      return res.status(400).json({ message: "Resume file is required" });
    }

    //  Cloudinary stores the file and multer gives us this:
    const resumeUrl = req.file.path; // Cloudinary secure URL
    const resumePublicId = req.file.filename; // Cloudinary public_id

    //  Check if job exists
    const job = await JobModel.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    //  Check duplicate application
    const existingApp = await Application.findOne({ job: jobId, user: userId });
    if (existingApp) {
      return res
        .status(400)
        .json({ message: "You already applied for this job" });
    }

    // Create new application
    const application = new Application({
      job: jobId,
      user: userId,
      name,
      email,
      coverLetter,
      resume: resumeUrl,
      resumePublicId,
    });

    await application.save();

    // Include a separate link for in-browser viewing
    const viewResumeURL = resumeUrl; // Same URL, can be opened in iframe or new tab

    res.status(201).json({
      message: "Application submitted successfully",
      application: {
        ...application.toObject(),
        viewResumeURL, // for frontend to open in browser
      },
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Error applying for job", error: err.message });
  }
};

exports.getEmployerJobsWithApplicants = async (req, res) => {
  try {
    const employerId = req.user.id; // from token

    // Step 1: Find all jobs created by this employer
    const jobs = await JobModel.find({ createdBy: employerId });

    if (!jobs || jobs.length === 0) {
      return res
        .status(404)
        .json({ message: "No jobs found for this employer" });
    }

    // Step 2: For each job, get all applications (with user details)
    const jobsWithApplicants = await Promise.all(
      jobs.map(async (job) => {
        const applications = await Application.find({ job: job._id })
          .populate("user", "name email phone") // populate applicant info
          .select("status createdAt"); // select fields from Application

        return {
          _id: job._id,
          title: job.title,
          company: job.company,
          description: job.description,
          date: job.date,
          totalApplicants: applications.length,
          applicants: applications,
        };
      })
    );

    res.status(200).json(jobsWithApplicants);
  } catch (error) {
    console.error("Error fetching employer jobs with applicants:", error);
    res.status(500).json({ message: "Failed to fetch jobs with applicants" });
  }
};

//  -----------------apply for job--------------------

exports.applicantsforJob = async (req, res) => {
  try {
    const jobId = req.params.id;

    // Check if the job exists
    const job = await JobModel.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Fetch all applications for that job
    const applications = await Application.find({ job: jobId })
      .populate("user", "name email") // include user details (optional)
      .sort({ createdAt: -1 }); // newest first

    // If no one applied
    if (applications.length === 0) {
      return res
        .status(200)
        .json({ message: "No applicants yet.", applicants: [] });
    }

    // Return all applicants
    res.status(200).json({
      message: `Applicants for job: ${job.title}`,
      applicants: applications,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching applicants",
      error: error.message,
    });
  }
};

// ---------------------------get apply jobs by id----------------------------

exports.getapplyjobs = async (req, res) => {
  try {
    const { id } = req.params; // e.g. /api/jobs/12345

    const getapplicants = await Application.find({ user: id })
      .populate("job")
      .sort({ createdAt: -1 });
    // console.log(getapplicants)

    if (!getapplicants) {
      return res.json({ status: false, msg: "No applyjob found" });
    }
    // console.log(getapplicants)
    res.json({
      status: true,
      msg: "Application fetched successfully",
      job: getapplicants,
    });
  } catch (error) {
    console.error("Error fetching application:", error);
    res.status(500).json({ status: false, msg: "Server error" });
  }
};

// --------------------------toggle status of job----------------------

exports.toggleJobStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await JobModel.findById(id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    job.status = job.status === "active" ? "closed" : "active";
    await job.save();

    res.json({ message: `Job ${job.status} successfully`, job });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// const mongoose = require("mongoose");
// const User = require("../models/User");
// const Job = require("../models/Job");

//  ---------------saved job---------------

exports.saveJob = async (req, res) => {
  try {
    const userId = req.user.id;
    const jobId = req.params.id;

    // Validate job ID
    if (!mongoose.isValidObjectId(jobId)) {
      return res.status(400).json({ message: "Invalid job ID" });
    }

    // Check if job exists
    const job = await JobModel.findById(jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    // Find the user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if job is already saved
    const isSaved = user.savedJobs.includes(jobId);

    let updatedUser;
    let message;

    if (isSaved) {
      //  Unsave (remove job)
      updatedUser = await User.findByIdAndUpdate(
        userId,
        { $pull: { savedJobs: jobId } },
        { new: true }
      );
      message = "Job removed from saved list";
    } else {
      //  Save (add job)
      updatedUser = await User.findByIdAndUpdate(
        userId,
        { $addToSet: { savedJobs: jobId } },
        { new: true }
      );
      message = "Job saved successfully";
    }

    res.status(200).json({
      success: true,
      message,
      savedJobs: updatedUser.savedJobs,
    });
  } catch (error) {
    console.error("Error saving job:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

//-----------------get saved jobs---------------
exports.getSaveJobs = async (req, res) => {
  try {
    const userId = req.user.id;

    // Populate with selected fields for better performance
    const user = await User.findById(userId)
      .populate({
        path: "savedJobs",
        model: "Jobs",
        select: "title company location description createdAt", // choose fields to return
      });

    if (!user || !user.savedJobs || user.savedJobs.length === 0) {
      return res.json({
        success: false,
        message: "No saved jobs found",
        jobs: [],
      });
    }

    res.json({
      success: true,
      message: "Saved jobs fetched successfully",
      jobs: user.savedJobs,
    });
  } catch (error) {
    console.error(" Error fetching saved jobs:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


//------------remove savedjob-----------
// controllers/jobController.js

exports.removesavejob = async (req, res) => {

  try {
    const userId = req.user.id; // coming from "protect" middleware
    const jobId = req.params.id;

    // console.log("Removing job:", jobId, "for user:", userId);

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ status: false, msg: "User not found" });
    }

    // check if job exists in saved list
    if (!user.savedJobs.includes(jobId)) {
      return res.status(404).json({ status: false, msg: "Job not found in saved list" });
    }

    // remove jobId from array
    user.savedJobs = user.savedJobs.filter(
      (savedJobId) => savedJobId.toString() !== jobId
    );

    await user.save();

    res.json({ status: true, msg: "Job removed successfully" });
  } catch (error) {
    console.error("Error removing saved job:", error);
    res.status(500).json({ status: false, msg: "Server error" });
  }
};

