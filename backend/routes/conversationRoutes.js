const express = require("express");
const router = express.Router();
const Conversation = require("../models/Conversation");
const ConversationMessage = require("../models/ConversationMessage");
const authMiddleware = require("../middleware/authMiddleware");

// route to get all conversations
router.get("/", authMiddleware, async (req, res) => {
  try {
    const conversations = await Conversation.find({ participants: req.user.id })
      .populate("participants", "username avatar")
      .sort({ updatedAt: -1 });
    res.json(conversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ message: "Error fetching conversations" });
  }
});

// route to get a single conversation
router.get("/:conversationId", authMiddleware, async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.conversationId,
      participants: req.user.id,
    }).populate("participants", "username avatar");

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const messages = await ConversationMessage.find({
      conversation: conversation._id,
    })
      .populate("sender", "username avatar")
      .sort({ createdAt: 1 });

    res.json({ conversation, messages });
  } catch (error) {
    console.error("Error fetching conversation:", error);
    res.status(500).json({ message: "Error fetching conversation" });
  }
});

// route to create a new conversation
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { participants } = req.body;
    if (!participants.includes(req.user.id)) {
      participants.push(req.user.id);
    }

    const newConversation = new Conversation({ participants });
    await newConversation.save();

    res.status(201).json(newConversation);
  } catch (error) {
    res.status(500).json({ message: "Error creating conversation" });
  }
});

// route to add a message to a conversation
router.post("/:conversationId/messages", authMiddleware, async (req, res) => {
  try {
    const { content } = req.body;
    const conversation = await Conversation.findOne({
      _id: req.params.conversationId,
      participants: req.user.id,
    });

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const newMessage = new ConversationMessage({
      conversation: conversation._id,
      sender: req.user.id,
      content,
    });
    await newMessage.save();

    conversation.messages.push(newMessage._id);
    conversation.updatedAt = Date.now();
    await conversation.save();

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: "Error adding message to conversation" });
  }
});

// route to add a participant to a conversation
router.post(
  "/:conversationId/participants",
  authMiddleware,
  async (req, res) => {
    try {
      const { userId } = req.body;
      const conversation = await Conversation.findOne({
        _id: req.params.conversationId,
        participants: req.user.id,
      });

      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }

      if (conversation.participants.includes(userId)) {
        return res
          .status(400)
          .json({ message: "User is already in the conversation" });
      }

      conversation.participants.push(userId);
      await conversation.save();

      res.json(conversation);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error adding participant to conversation" });
    }
  }
);

// route to delete a conversation
router.delete("/:conversationId", authMiddleware, async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.conversationId,
      participants: req.user.id,
    });
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }
    await ConversationMessage.deleteMany({ conversation: conversation._id });
    await conversation.deleteOne();
    res.json({ message: "Conversation deleted successfully" });
  } catch (error) {
    console.error("Error deleting conversation:", error);
    res
      .status(500)
      .json({ message: "Error deleting conversation", error: error.message });
  }
});

module.exports = router;
