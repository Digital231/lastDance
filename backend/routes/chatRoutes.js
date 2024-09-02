const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/:room", authMiddleware, async (req, res) => {
  try {
    const messages = await chatController.getMessages(req.params.room);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Error fetching messages" });
  }
});

router.post("/:messageId/like", authMiddleware, async (req, res) => {
  try {
    const message = await chatController.likeMessage(
      req.params.messageId,
      req.user.id
    );
    res.json(message);
  } catch (error) {
    res.status(500).json({ message: "Error liking/unliking message" });
  }
});

router.post("/:messageId/like", authMiddleware, async (req, res) => {
  try {
    const message = await chatController.likeMessage(
      req.params.messageId,
      req.user.id
    );
    res.json(message);
  } catch (error) {
    console.error("Error in like route:", error);
    res
      .status(500)
      .json({ message: "Error liking/unliking message", error: error.message });
  }
});

module.exports = router;
