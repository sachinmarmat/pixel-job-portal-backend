const express = require('express');
const router = express.Router();
const { createJob, getAllJobs, getJobsbyId , updateJob, deleteJob, applyJob, toggleJobStatus, applicantsforJob, saveJob, getSaveJobs, getapplyjobs, getEmployerJobsWithApplicants, removesavejob} = require('../controllers/jobController');
const { protect, allowRoles,   } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadResume');



router.post('/create', protect, allowRoles('employ'), createJob)
router.get('/', getAllJobs)
router.get('/:id', getJobsbyId)
router.put('/:id', protect, allowRoles('employ'), updateJob)
router.delete('/:id', protect, allowRoles('employ'), deleteJob) 
router.post('/:id/apply', protect, allowRoles('jobseeker'), upload.single("resume") , applyJob)
router.put('/:id/savejob', protect, allowRoles('jobseeker') , saveJob)
router.get('/:id/getSaveJobs', protect, allowRoles('jobseeker') , getSaveJobs)
router.delete('/:id/removesavejob', protect, allowRoles('jobseeker'), removesavejob);
router.get('/:id/getapplyjobs', protect, allowRoles('jobseeker') , getapplyjobs)
router.get('/:id/applicants', protect, allowRoles('employ', 'admin'),  applicantsforJob);
router.put('/:id/togglestatus', protect, allowRoles('employ', 'admin'), toggleJobStatus)
router.get('/:id/getEmployerJobsWithApplicants', protect, allowRoles('employ', 'admin'), getEmployerJobsWithApplicants)


module.exports = router; 
