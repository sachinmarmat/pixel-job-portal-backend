const User = require("../models/User");

// const User = require("../models/User");
const Employer = require("../models/Employer");

exports.profile = async (req, res) => {
  try {
    const { id, role } = req.user; // coming from token
    let userData;

    if (role === "employ") {
      // Fetch from Employer collection
      userData = await Employer.findById(id).select("-password -refreshToken");
    } else {
      // Fetch from User collection (default jobseeker)
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
    console.error("Profile error:", error.message);
    res.status(500).json({ status: false, msg: "Server error" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id; // from token
    const { name, email, phone, website, companyName } = req.body;

    // Try finding user in both collections
    let existingUser = await User.findById(userId);
    let existingEmployer = await Employer.findById(userId);

    // If neither found
    if (!existingUser && !existingEmployer) {
      return res.status(404).json({ status: false, msg: "User/Employer not found" });
    }

    let updatedDoc;

    // ✅ If it's a normal user
    if (existingUser) {
      existingUser.name = name || existingUser.name;
      existingUser.email = email || existingUser.email;
      existingUser.phone = phone || existingUser.phone;

      updatedDoc = await existingUser.save();
    }

    // ✅ If it's an employer
    if (existingEmployer) {
      existingEmployer.name = name || existingEmployer.name;
      existingEmployer.email = email || existingEmployer.email;
      existingEmployer.phone = phone || existingEmployer.phone;
      existingEmployer.website = website || existingEmployer.website;
      existingEmployer.companyName = companyName || existingEmployer.companyName;

      updatedDoc = await existingEmployer.save();
    }

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


