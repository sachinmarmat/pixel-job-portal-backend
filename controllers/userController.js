const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Employer = require("../models/Employer");

// ===========================
//  GET PROFILE
// ===========================
exports.profile = async (req, res) => {
  try {
    const { id, role } = req.user; // from JWT token
    let userData;

    if (role === "employ") {
      //  Employer profile
      userData = await Employer.findById(id).select("-password -refreshToken");
    } else {
      //  Default jobseeker
      userData = await User.findById(id).select("-password -refreshToken");
    }

    if (!userData)
      return res
        .status(404)
        .json({ status: false, msg: "User not found in any collection" });

    res.json({
      status: true,
      msg: "Profile fetched successfully",
      user: userData,
    });
  } catch (error) {
    console.error("Profile fetch error:", error.message);
    res.status(500).json({ status: false, msg: "Server error" });
  }
};

// ===========================
//  UPDATE PROFILE
// ===========================
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      name,
      email,
      phone,
      website,
      company,
      currentRole,
      experienceYears,
      currentSalary,
      expectedSalary,
      summary,
      skills,
      languages,
      password,
      address,
      education,
      projects,
      experience,
      about,
      founded,
      companysize,
      service,
      other,
    } = req.body;

    //  Check which model to update
    const existingUser = await User.findById(userId);
    const existingEmployer = !existingUser
      ? await Employer.findById(userId)
      : null;

    if (!existingUser && !existingEmployer) {
      return res
        .status(404)
        .json({ status: false, msg: "User or Employer not found" });
    }

    let updatedDoc;

    //   NORMAL USER (Job Seeker)

    if (existingUser) {
      if (name) existingUser.name = name;
      if (email) existingUser.email = email;
      if (phone) existingUser.phone = phone;
      if (address) existingUser.address = address;
      if (website) existingUser.website = website;
      if (company) existingUser.company = company;
      if (currentRole) existingUser.currentRole = currentRole;
      if (experienceYears) existingUser.experienceYears = experienceYears;
      if (currentSalary) existingUser.currentSalary = currentSalary;
      if (expectedSalary) existingUser.expectedSalary = expectedSalary;
      if (summary) existingUser.summary = summary;

      if (Array.isArray(skills)) existingUser.skills = skills;
      if (Array.isArray(languages)) existingUser.languages = languages;

      //  Properly handle arrays
      if (Array.isArray(education)) existingUser.education = education;
      if (Array.isArray(projects)) existingUser.projects = projects;
      if (Array.isArray(experience)) existingUser.experience = experience;

      //  Securely update password
      if (password && password.trim() !== "") {
        const salt = await bcrypt.genSalt(10);
        existingUser.password = await bcrypt.hash(password, salt);
      }

      updatedDoc = await existingUser.save();
    }

    // ====================================
    //  EMPLOYER
    // ====================================
    if (existingEmployer) {
      if (name) existingEmployer.name = name;
      if (email) existingEmployer.email = email;
      if (phone) existingEmployer.phone = phone;
      if (address) existingEmployer.address = address;
      if (website) existingEmployer.website = website;
      if (company) existingEmployer.company = company;
      if (about) existingEmployer.about = about;
      if (founded) existingEmployer.founded = founded;
      if (companysize) existingEmployer.companysize = companysize;
      // Convert string -> array
      if (service) {
        existingEmployer.service = Array.isArray(service)
          ? service
          : service.split(",").map((s) => s.trim());
      }

      if (other) {
        existingEmployer.other = Array.isArray(other)
          ? other
          : other.split(",").map((s) => s.trim());
      }

      // Secure password update
      if (password && password.trim() !== "") {
        const salt = await bcrypt.genSalt(10);
        existingEmployer.password = await bcrypt.hash(password, salt);
      }

      updatedDoc = await existingEmployer.save();
    }

    //  Response
    res.json({
      status: true,
      msg: "Profile updated successfully",
      user: updatedDoc,
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ status: false, msg: "Server error" });
  }
};
