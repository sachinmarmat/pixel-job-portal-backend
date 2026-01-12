// seedAdmin.js
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();
const User = require("./models/User"); // path to your User model

async function createAdmin() {
  try {
    // Connect to DB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("Connected to MongoDB");

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: "admin" });
    if (existingAdmin) {
      console.log("Admin already exists:", existingAdmin.email);
      process.exit();
    }

    // Hash password
    const hashedPassword = await bcrypt.hash("Sachin@2204", 10);

    // Create Admin 
    const admin = await User.create({
      name: "Sachin marmat",
      email: "sachinmarmat671@gmail.com",
      password: hashedPassword,
      role: "admin",
      isVerified: true
    });

    console.log("Admin created successfully:", admin.email);
    process.exit();

  } catch (err) {
    console.error("Error creating admin:", err);
    process.exit(1);
  }
}

createAdmin();
