const Message = require("../models/Message");

// 📨 Send Message (User → Admin)
exports.sendMessage = async (req, res) => {
  try {
    const { name, email, subject, message, phone } = req.body;
    const userId = req.user ? req.user.id : null; // optional if protected


    if (!name || !email || !message ) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const newMessage = new Message({
      name,
      email,
      subject,
      message,
      phone,
      userId,
    });

    await newMessage.save();
    res
      .status(201)
      .json({ success: true, message: "Message sent successfully!" });
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

//  Get All Messages (Admin)
exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, messages });
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 🗑 Delete Message
exports.deleteMessage = async (req, res) => {
  try {
    await Message.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Message deleted" });
  } catch (error) {
    console.error("Delete message error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
