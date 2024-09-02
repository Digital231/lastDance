const ChatMessage = require("../models/ChatMessage");

exports.saveMessage = async (messageData) => {
  try {
    const newMessage = new ChatMessage(messageData);
    await newMessage.save();
    return newMessage.populate("sender", "username avatar");
  } catch (error) {
    console.error("Error saving message:", error);
    throw error;
  }
};

exports.getMessages = async (room) => {
  try {
    return await ChatMessage.find({ room })
      .sort({ createdAt: 1 })
      .populate("sender", "username avatar");
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }
};

exports.likeMessage = async (messageId, userId) => {
  try {
    const message = await ChatMessage.findById(messageId);
    if (!message) {
      throw new Error("Message not found");
    }

    const likeIndex = message.likes.indexOf(userId);
    if (likeIndex > -1) {
      message.likes.splice(likeIndex, 1);
    } else {
      message.likes.push(userId);
    }

    await message.save();

    return await message.populate("sender", "username avatar");
  } catch (error) {
    console.error("Error liking/unliking message:", error);
    throw error;
  }
};
