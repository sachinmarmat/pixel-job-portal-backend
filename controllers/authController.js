const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { setTokens } = require("../middleware/authMiddleware");
const transporter = require("../utils/mailer");
const Joi = require("joi");
const mongoSanitize = require("express-mongo-sanitize"); // for input sanitization
const xss = require("xss"); // for sanitizing text fields
const Employer = require("../models/Employer");

// --------------------------- Validation Schemas ---------------------------
const signupUserSchema = Joi.object({
  name: Joi.string().min(3).max(30).trim().required(),
  email: Joi.string().email().lowercase().required(),
  password: Joi.string()
    .min(8)
    .max(64)
    .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*])"))
    .required()
    .messages({
      "string.pattern.base":
        "Password must contain uppercase, lowercase, number, and special character.",
    }),
  // role: Joi.string().valid("employ", "jobseeker").required(),
});
const signupEmployerSchema = Joi.object({
  name: Joi.string().min(3).max(30).trim().required(),
  email: Joi.string().email().lowercase().required(),
  password: Joi.string()
    .min(8)
    .max(64)
    .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*])"))
    .required()
    .messages({
      "string.pattern.base":
        "Password must contain uppercase, lowercase, number, and special character.",
    }),
  // role: Joi.string().valid("employ", "jobseeker").required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().required(),
});

// --------------------------- SignupUser ---------------------------
exports.Usersignup = async (req, res) => {
  try {
    // Sanitize input to prevent NoSQL injection & XSS
    mongoSanitize.sanitize(req.body);
    const safeName = xss(req.body.name);
    const safeEmail = xss(req.body.email);

    // Validate input
    const { error, value } = signupUserSchema.validate({
      name: safeName,
      email: safeEmail,
      password: req.body.password,
      // role: req.body.role,
    });
    if (error)
      return res
        .status(400)
        .json({ status: false, msg: error.details[0].message });

    const { name, email, password } = value;

    // Check duplicate email
    const existingUser = await User.findOne({ email });
    // const existingInUser = await User.findOne({ email });
    const existingInEmployer = await Employer.findOne({ email });

    if (existingUser || existingInEmployer) {
      return res
        .status(409)
        .json({ status: false, msg: "Email already in use" });
    }

    //  Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    //  Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      isVerified: false,
    });

    //  Generate verification token
    const verifyToken = jwt.sign(
      { id: user._id },
      process.env.EMAIL_SECRET,
      { expiresIn: "10m" }
    );

    const verifyUrl = `https://pixel-job-portal-backend.onrender.com/api/auth/verify/${verifyToken}`; 
    // SERVER_URL should be like http://localhost:8080 in .env

    // Send verification email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Verify your email",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
          <h2 style="color: #4CAF50;">Welcome to PixelGenix!</h2>
          <p>Hi ${user.name},</p>
          <p>Thanks for registering. Please verify your email address by clicking the button below:</p>
          <a href="${verifyUrl}" style="display: inline-block; padding: 10px 20px; margin: 10px 0; background-color: #4CAF50; color: #fff; text-decoration: none; border-radius: 5px;">Verify Email</a>
          <p>This link expires in 10 minutes.</p>
          <p>If you did not create an account, you can safely ignore this email.</p>
          <p>Cheers,<br>PixelGenix Team</p>
        </div>
      `,
    });

    res.status(201).json({
      status: true,
      msg: "User created. Please check your email to verify your account.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, msg: "Server error" });
  }
};


// -------------------------employer signup---------
exports.Employersignup = async (req, res) => {
  try {
    // Sanitize input to prevent NoSQL injection & XSS
    mongoSanitize.sanitize(req.body);
    const safeName = xss(req.body.name);
    const safeEmail = xss(req.body.email);

    // Validate input
    const { error, value } = signupEmployerSchema.validate({
      name: safeName,
      email: safeEmail,
      password: req.body.password,
      // role: req.body.role,
    });
    if (error)
      return res
        .status(400)
        .json({ status: false, msg: error.details[0].message });

    const { name, email, password } = value;

    // Check duplicate email
    const existingUser = await Employer.findOne({ email });
    const existingJobseeker = await User.findOne({ email });

    if (existingUser || existingJobseeker) {
      return res
        .status(409)
        .json({ status: false, msg: "Email already in use" });
    }
    if (existingUser)
      return res
        .status(409)
        .json({ status: false, msg: "Email already in use" });

    //  Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    //  Create user
    const user = await Employer.create({
      name,
      email,
      password: hashedPassword,
      // role,
      isVerified: false,
    });

    //  Generate verification token
    const verifyToken = jwt.sign(
      { id: user._id },
      process.env.EMAIL_SECRET,
      { expiresIn: "10m" }
    );

    const verifyUrl = `https://pixel-job-portal-backend.onrender.com/api/auth/verify/${verifyToken}`; 
    // SERVER_URL should be like http://localhost:8080 in .env

    // Send verification email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Verify your email",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
          <h2 style="color: #4CAF50;">Welcome to PixelGenix!</h2>
          <p>Hi ${user.name},</p>
          <p>Thanks for registering. Please verify your email address by clicking the button below:</p>
          <a href="${verifyUrl}" style="display: inline-block; padding: 10px 20px; margin: 10px 0; background-color: #4CAF50; color: #fff; text-decoration: none; border-radius: 5px;">Verify Email</a>
          <p>This link expires in 1 hour.</p>
          <p>If you did not create an account, you can safely ignore this email.</p>
          <p>Cheers,<br>PixelGenix Team</p>
        </div>
      `,
    });

    res.status(201).json({
      status: true,
      msg: "User created. Please check your email to verify your account.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, msg: "Server error" });
  }
};


// --------------------------- userLogin ---------------------------

// exports.Userlogin = async (req, res) => {
//   try {
//     //  Sanitize input----------------------
//     mongoSanitize.sanitize(req.body);
//     const safeEmail = xss(req.body.email);

//     //  Validate input---------------------------------------------------
//     const { error, value } = loginSchema.validate({
//       email: safeEmail,
//       password: req.body.password,
//     });
//     if (error)
//       return res
//         .status(400)
//         .json({ status: false, msg: error.details[0].message });

//     const { email, password } = value;

//     //  Check user existence-----------------------------------------------
//     const user = await User.findOne({ email });
//     if (!user)
//       return res.status(404).json({ status: false, msg: "User not found" });




//     if (user.status === "suspended") {
//       if (user.suspendedUntil && new Date() > user.suspendedUntil) {
//         // suspension expired → reactivate
//         user.status = "active";
//         user.suspendedUntil = null;
//         await user.save();
//       } else {
//         return res.status(403).json({ message: "Your account is suspended until " + user.suspendedUntil });
//       }
//     }

//     //  Ensure email verified------------------------------
//     // if (!user.isVerified)
//     //   return res.status(403).json({
//     //     status: false,
//     //     msg: "Please verify your email before logging in.",
//     //   });

//     // Compare password------------------------------------------------
//     const matchedPassword = await bcrypt.compare(password, user.password);
//     if (!matchedPassword)
//       return res.status(401).json({ status: false, msg: "Invalid credentials" });

//     // Generate tokens---------------------------------------------
//     const { accessToken, refreshToken } = await setTokens(user);

//     // Send login notification (optional)
//     await transporter.sendMail({
//       from: process.env.EMAIL_USER,
//       to: user.email,
//       subject: "Login Notification",
//       text: `Hello ${user.name},\n\nYou logged in to PixelGenix.\nIf this wasn't you, please reset your password immediately.`,
//     });

//     res.status(200).json({
//       status: true,
//       msg: "Login successful",
//       user: { id: user._id, name: user.name, email: user.email, role: user.role },
//       accessToken,
//       refreshToken,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ status: false, msg: "Server error" });
//   }
// };


// ------------------Employerlogin -------------------------------------------------------------

// exports.Empoyerlogin = async (req, res) => {
//   try {
//     //  Sanitize input----------------------
//     mongoSanitize.sanitize(req.body);
//     const safeEmail = xss(req.body.email);

//     //  Validate input---------------------------------------------------
//     const { error, value } = loginSchema.validate({
//       email: safeEmail,
//       password: req.body.password,
//     });
//     if (error)
//       return res
//         .status(400)
//         .json({ status: false, msg: error.details[0].message });

//     const { email, password } = value;

//     //  Check user existence-----------------------------------------------
//     const user = await Employer.findOne({ email });
//     if (!user)
//       return res.status(404).json({ status: false, msg: "User not found" });


//     if (user.status === "suspended") {
//       if (user.suspendedUntil && new Date() > user.suspendedUntil) {
//         // suspension expired → reactivate
//         user.status = "active";
//         user.suspendedUntil = null;
//         await user.save();
//       } else {
//         return res.status(403).json({ message: "Your account is suspended until " + user.suspendedUntil });
//       }
//     }

//     //  Ensure email verified------------------------------
//     // if (!user.isVerified)
//     //   return res.status(403).json({
//     //     status: false,
//     //     msg: "Please verify your email before logging in.",
//     //   });

//     // Compare password------------------------------------------------
//     const matchedPassword = await bcrypt.compare(password, user.password);
//     if (!matchedPassword)
//       return res.status(401).json({ status: false, msg: "Invalid credentials" });

//     // Generate tokens---------------------------------------------
//     const { accessToken, refreshToken } = await setTokens(user);

//     // Send login notification (optional)
//     // await transporter.sendMail({
//     //   from: process.env.EMAIL_USER,
//     //   to: user.email,
//     //   subject: "Login Notification",
//     //   text: `Hello ${user.name},\n\nYou logged in to PixelGenix.\nIf this wasn't you, please reset your password immediately.`,
//     // });

//     res.status(200).json({
//       status: true,
//       msg: "Login successful",
//       user: { id: user._id, name: user.name, email: user.email, role: user.role },
//       accessToken,
//       refreshToken,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ status: false, msg: "Server error" });
//   }
// };

// ----------------All user login--------------------------

exports.login = async (req, res) => {
  try {
    // Sanitize input
    mongoSanitize.sanitize(req.body);
    const safeEmail = xss(req.body.email);

    // Validate input
    const { error, value } = loginSchema.validate({
      email: safeEmail,
      password: req.body.password,
    });
    if (error)
      return res
        .status(400)
        .json({ status: false, msg: error.details[0].message });

    const { email, password } = value;
    

    // Check both collections
    let user = await User.findOne({ email });
    
    // console.log('hello user', user)
   
    

    if (!user) {
      user = await Employer.findOne({ email });
      // role = user.role;
      // console.log('hello employer' , user)
    }

    if (!user) return res.status(404).json({ status: false, msg: "Email not registered. Please sign up first!" });

    // Handle suspended users
    if (user.status === "suspended") {
      if (user.suspendedUntil && new Date() > user.suspendedUntil) {
        // suspension expired → reactivate
        user.status = "active";
        user.suspendedUntil = null;
        await user.save();
      } else {
        return res.status(403).json({ message: "Your account is suspended until " + user.suspendedUntil });
      }
    }


      // Ensure email verified------------------------------
    if (!user.isVerified)
      return res.status(403).json({
        status: false,
        msg: "Please verify your email before logging in.",
      });



    // Compare password
    const matchedPassword = await bcrypt.compare(password, user.password);
    if (!matchedPassword)
      return res.status(401).json({ status: false, msg: "Invalid Password" });

    // Generate tokens
    const { accessToken, refreshToken } = await setTokens(user);

    // Optional: send login notification
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Login Notification",
      text: `Hello ${user.name},\n\nYou logged in to PixelGenix.\nIf this wasn't you, please reset your password immediately.`,
    });

    res.status(200).json({
      status: true,
      msg: "Login successful",
      user: { id: user._id, name: user.name, email: user.email, role :user.role },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, msg: "Server error" });
  }
};





// --------------------------- Email Verification ---------------------------
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    if (!token) return res.status(400).send(" No token provided");

    const decoded = jwt.verify(token, process.env.EMAIL_SECRET);
    let user = await User.findById(decoded.id);

    if(!user) {
      user=await Employer.findById(decoded.id)
    } 

    if (!user) return res.status(404).send("User not found");

    if (user.isVerified) {
      return res.send(`
        <h2>Email Already Verified </h2>
        <p>Your email was already verified. You can now log in.</p>
      `);
    }

    user.isVerified = true;
    await user.save();

    // Send a professional HTML message
    res.send(`
      <h2>Email Verified Successfully </h2>
      <p>Hi ${user.name}, your email has been verified. You can now log in.</p>
      <p>Thank you for joining PixelGenix!</p>
    `);
  } catch (error) {
    console.error(error);
    res.status(400).send("<h2>Invalid or expired token </h2><p>Please request a new verification email.</p>");
  }
};



// --------------------------- Resend Verification ---------------------------
exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
  
    if (!email) return res.status(400).json({ msg: "Email is required" });

    let user = await User.findOne({ email });
    // if (!user) return res.status(404).json({ msg: "User not found" });
    
    if(!user)   user = await Employer.findOne({ email });
    if (!user) return res.status(404).json({ msg: "User not found" }); 
    

    if (user.isVerified)
      return res.status(400).json({ msg: "User already verified" });

    // Generate new token
    const verifyToken = jwt.sign({ id: user._id }, process.env.EMAIL_SECRET, {
      expiresIn: "1h",
    });

    const verifyUrl = `https://pixel-job-portal-backend.onrender.com/api/auth/verify/${verifyToken}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Resend Verification Email",
      html: `
        <h2>Verify your email again</h2>
        <p>Hi ${user.name},</p>
        <p>Click the button below to verify your email:</p>
        <a href="${verifyUrl}" style="padding: 10px 20px; background: #4CAF50; color: #fff; text-decoration: none; border-radius: 5px;">Verify Email</a>
        <p>This link expires in 1 hour.</p>
      `,
    });

    res.status(200).json({
      status: true,
      msg: "Verification email resent. Please check your inbox.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
};

