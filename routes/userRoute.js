const express = require('express');
const router = express.Router();
const {  profile, updateProfile } = require('../controllers/userController');
const {protect}= require('../middleware/authMiddleware')


router
  .route("/profile")
  .get(protect, profile)
  .put(protect, updateProfile)




module.exports = router;