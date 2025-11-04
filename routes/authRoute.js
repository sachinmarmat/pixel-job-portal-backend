const express = require('express');
const router = express.Router();
const { Usersignup, login, verifyEmail, resendVerification, Employersignup, Userlogin, Empoyerlogin } = require('../controllers/authController');


router.post('/user/register',Usersignup);
router.post('/user/login',  login);
// employer route--------------------------------
router.post('/employer/register',Employersignup);
// router.post('/employer/login',  login);
router.get('/verify/:token' , verifyEmail);
router.post("/resend-verification", resendVerification);

// /api/auth/user/register


// router.get('/logout', protect , me);



module.exports = router;
