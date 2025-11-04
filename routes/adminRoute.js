const express= require('express');
const router= express.Router();
const { allowRoles, protect } = require('../middleware/authMiddleware');
const { deleteUser, deleteEmployer, deleteJob, suspendUser, reactivateUser, reactivateEmployer, suspendEmployer, getjobseeker, getemploye, getAllJobs} = require('../controllers/adminController');


// router.put("/employer/:id/status", allowRoles('admin'), status);

// -------------user suspend and reactivate----------------------------------------
router.put("/user/:id/suspenduser", protect, allowRoles('admin'), suspendUser);
router.put("/user/:id/reactivateuser",protect, allowRoles('admin'), reactivateUser);

// -------------employer suspend and reactivate -------------------------------
router.put("/employer/:id/suspendemployer", protect, allowRoles('admin'), suspendEmployer);
router.put("/employer/:id/reactivateemployer", protect ,allowRoles('admin'), reactivateEmployer);

// ------------------------delete user------------------------
router.delete("/user/:id",protect, allowRoles('admin'), deleteUser);

// --------------------------delete employer-----------------------
router.delete("/employer/:id",protect, allowRoles('admin'), deleteEmployer);

// -------------------------delete job----------------------------------
router.delete("/job/:id",protect, allowRoles('admin'), deleteJob);

//------------get jobseeker---------------------------
router.get("/getjobseeker",protect, allowRoles('admin'), getjobseeker);

//-----------get Employers-----------------
router.get("/getemploye",protect, allowRoles('admin'), getemploye);

//-------------------------get alljobs--------------
router.get("/getAllJobs",protect, allowRoles('admin'), getAllJobs);


module.exports = router;
