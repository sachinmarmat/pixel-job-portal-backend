const { json } = require('express');

const User = require('../models/User');
const Employer = require('../models/Employer');
const Job = require('../models/Job');




// ---------------------Suspend User/Employer---------------------
const calculateSuspendedUntil = (duration) => {
  if (!duration) return null;

  let suspendedUntil = new Date();

  if (typeof duration === "string") {
    const num = parseInt(duration);
    if (duration.endsWith("d")) suspendedUntil.setDate(suspendedUntil.getDate() + num);
    else if (duration.endsWith("h")) suspendedUntil.setHours(suspendedUntil.getHours() + num);
    else if (duration.endsWith("w")) suspendedUntil.setDate(suspendedUntil.getDate() + num * 7);
    else if (duration.endsWith("m")) suspendedUntil.setMinutes(suspendedUntil.getMinutes() + num);
    else suspendedUntil.setDate(suspendedUntil.getDate() + num);
  } else if (typeof duration === "number") {
    suspendedUntil.setDate(suspendedUntil.getDate() + duration);
  }
  return suspendedUntil;
};

// Generic suspend function
const suspendAccount = async (Model, id, duration, reason) => {
  const suspendedUntil = calculateSuspendedUntil(duration);

  const account = await Model.findByIdAndUpdate(
    id,
    { status: "suspended", suspendedUntil, suspensionReason: reason || "No reason provided" },
    { new: true }
  );

  return account;
};


//-------------get Jobseeker-------------

exports.getjobseeker = async (req, res) => {
  try {
    const alljobseeker = await User.find({});

    if (!alljobseeker) return res.json({ status: false, msg: 'no user available' })

    res.json({
      status: true,
      msg: "All Jobseeker fetched ",
      jobseeker: alljobseeker
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ status: false, msg: "Server error" });
  }
};



//-----------------------get employe--------------------------

exports.getemploye = async (req, res) => {
  try {
    const allemploye = await Employer.find({});

    if (!allemploye) return res.json({ status: false, msg: 'no employe available' })

    res.json({
      status: true,
      msg: "All Employe fetched ",
      employe: allemploye
    });
  } catch (error) {
    console.error("Error fetching employe:", error);
    res.status(500).json({ status: false, msg: "Server error" });
  }
};

// -----------get all jobs------------------------

exports.getAllJobs = async (req, res) => {
  try {
    const alljobs = await Job.find({});

    if (!alljobs) return res.json({ status: false, msg: 'no jobs available' })

    res.json({
      status: true,
      msg: "All jobs fetched ",
      jobs: alljobs
    });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({ status: false, msg: "Server error" });
  }
};


// -----------Suspend User---------
exports.suspendUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { duration, reason } = req.body;

    const user = await suspendAccount(User, id, duration, reason);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User suspended successfully", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Suspend Employer
exports.suspendEmployer = async (req, res) => {
  try {
    const { id } = req.params;
    const { duration, reason } = req.body;

    const employer = await suspendAccount(Employer, id, duration, reason);
    if (!employer) return res.status(404).json({ message: "Employer not found" });

    res.json({ message: "Employer suspended successfully", employer });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------------Reactivate User/Employer---------------------
const reactivateAccount = async (Model, id) => {
  const account = await Model.findByIdAndUpdate(
    id,
    { status: "active", suspendedUntil: null, suspensionReason: null },
    { new: true }
  );

  return account;
};


// ----------------------reactivate user -----------------
exports.reactivateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await reactivateAccount(User, id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User Reactivated successfully", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// ----------------------reactivate Employer --------------------
exports.reactivateEmployer = async (req, res) => {
  try {
    const { id } = req.params;

    const employer = await reactivateAccount(Employer, id);
    if (!employer) return res.status(404).json({ message: "Employer not found" });

    res.json({ message: "Employer reactivated successfully", employer });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// ---------------------Suspend user--------------------
// exports.suspendUser = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { duration, reason } = req.body;

//     let suspendedUntil = null;

//     if (duration) {
//       suspendedUntil = new Date();

//       if (typeof duration === "string") {
//         const num = parseInt(duration);


//         if (duration.endsWith("d")) {
//           suspendedUntil.setDate(suspendedUntil.getDate() + num); // days
//         } else if (duration.endsWith("h")) {
//           suspendedUntil.setHours(suspendedUntil.getHours() + num); // hours
//         } else if (duration.endsWith("w")) {
//           suspendedUntil.setDate(suspendedUntil.getDate() + num * 7); // weeks
//         } else {
//           suspendedUntil.setDate(suspendedUntil.getDate() + num); // default = days
//         }
//       } else if (typeof duration === "number") {
//         suspendedUntil.setDate(suspendedUntil.getDate() + duration); // days
//       }
//     }


//     const user = await User.findByIdAndUpdate(
//       id,
//       { status: "suspended", suspendedUntil, suspensionReason: reason || "No reason provided" },
//       { new: true }
//     );

//     if (!user) return res.status(404).json({ message: "User not found" });

//     res.json({ message: "User suspended successfully", user });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };


// -----------------------suspend Employer--------------------
// exports.suspendEmpployer = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { duration, reason } = req.body; // e.g. "7d" or "30d"

//     let suspendedUntil = null;

//     if (duration) {
//       suspendedUntil = new Date();

//       if (typeof duration === "string") {
//         const num = parseInt(duration);


//         if (duration.endsWith("d")) {
//           suspendedUntil.setDate(suspendedUntil.getDate() + num); // days
//         } else if (duration.endsWith("h")) {
//           suspendedUntil.setHours(suspendedUntil.getHours() + num); // hours
//         } else if (duration.endsWith("w")) {
//           suspendedUntil.setDate(suspendedUntil.getDate() + num * 7); // weeks
//         } else {
//           suspendedUntil.setDate(suspendedUntil.getDate() + num); // default = days
//         }
//       } else if (typeof duration === "number") {
//         suspendedUntil.setDate(suspendedUntil.getDate() + duration); // days
//       }
//     }


//     const user = await Employer.findByIdAndUpdate(
//       id,
//       { status: "suspended", suspendedUntil, suspensionReason: reason || "No reason provided" },
//       { new: true }
//     );

//     if (!user) return res.status(404).json({ message: "User not found" });

//     res.json({ message: "User suspended successfully", user });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };


//------------------------ Reactivate user------------
// exports.reactivateUser = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const user = await User.findByIdAndUpdate(
//       id,
//       { status: "active", suspendedUntil: null, suspensionReason: null },
//       { new: true }
//     );

//     if (!user) return res.status(404).json({ message: "User not found" });

//     res.json({ message: "User reactivated successfully", user });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };


//  ----------------------reactivate employer---------------------
// exports.reactivateEmployer = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const user = await Employer.findByIdAndUpdate(
//       id,
//       { status: "active", suspendedUntil: null, suspensionReason: null },
//       { new: true }
//     );

//     if (!user) return res.status(404).json({ message: "User not found" });

//     res.json({ message: "User reactivated successfully", user });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };


// --------------------delete a Emploer--------------------------

exports.deleteEmployer = async (req, res) => {
  try {
    const { id } = req.params
    console.log(id)
    const matchUser = await Employer.findByIdAndDelete(id)
    if (!matchUser) return res.status(404).json({ status: false, msg: "user not found" })

    res.status(200).json({ status: true, msg: "user deleted" })

  } catch (error) {
    console.error("Error deleting job:", error);
    res.status(500).json({ status: false, msg: "Server error", error });
  }
}


// --------------------------delete a user-----------------------------------------------
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params
    console.log(id)
    const matchUser = await User.findByIdAndDelete(id)
    if (!matchUser) return res.status(404).json({ status: false, msg: "user not found" })

    res.status(200).json({ status: true, msg: "user deleted" })

  } catch (error) {
    console.error("Error deleting job:", error);
    res.status(500).json({ status: false, msg: "Server error", error });
  }
}


// -----------------------delete job -----------------------
exports.deleteJob = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedJob = await Job.findByIdAndDelete(id);

    if (!deletedJob) {
      return res.status(404).json({
        status: false,
        msg: "Job not found or not authorized to delete"
      });
    }

    res.json({
      status: true,
      msg: "Job deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting job:", error);
    res.status(500).json({ status: false, msg: "Server error" });
  }
};

