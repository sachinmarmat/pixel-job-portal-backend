const express = require("express");
const {
  sendMessage,
  getMessages,
  deleteMessage,
} = require("../controllers/informController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Public route: user → admin
router.post("/sendmassage",protect, sendMessage);

// Admin routes
router.get("/getmassage", protect, getMessages);
router.delete("/:id/deletemassage", protect, deleteMessage);

module.exports = router;
