const socketIo = require("socket.io");
const jwt = require("jsonwebtoken");
const chatController = require("./controllers/chatController");
const User = require("./models/User");
const Conversation = require("./models/Conversation");
const Notification = require("./models/Notification");
const ChatMessage = require("./models/ChatMessage");

function setupSocket(server) {
  const io = socketIo(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
    },
  });

  const users = {};

  io.use((socket, next) => {
    const token = socket.handshake.query?.token;
    if (token) {
      jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return next(new Error("Authentication error"));
        socket.decoded = decoded;
        next();
      });
    } else {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.decoded.user.id;
    users[userId] = socket.id;
    console.log("Connected to socket");

    socket.on("joinRoom", (room) => {
      socket.join(room);
    });

    socket.on("leaveRoom", (room) => {
      socket.leave(room);
    });

    socket.on("sendMessage", async ({ room, message }) => {
      try {
        const user = await User.findById(userId).select("username avatar");
        const savedMessage = await chatController.saveMessage({
          content: message,
          sender: userId,
          room: room,
        });
        io.to(room).emit("receiveMessage", {
          _id: savedMessage._id,
          content: savedMessage.content,
          sender: {
            _id: user._id,
            username: user.username,
            avatar: user.avatar,
          },
          room: savedMessage.room,
          likes: savedMessage.likes,
          createdAt: savedMessage.createdAt,
        });
      } catch (error) {
        console.error("Error saving and broadcasting message:", error);
      }
    });

    socket.on("startPrivateConversation", async ({ targetUserId }) => {
      try {
        const user = await User.findById(userId).select("username");
        const targetUser = await User.findById(targetUserId).select("username");

        const newConversation = new Conversation({
          participants: [userId, targetUserId],
        });
        await newConversation.save();

        const notification = new Notification({
          sender: userId,
          receiver: targetUserId,
          text: `${user.username} wants to start a private chat with you.`,
          conversationId: newConversation._id,
        });
        await notification.save();

        const targetSocketId = users[targetUserId];
        if (targetSocketId) {
          io.to(targetSocketId).emit("newNotification", {
            message: `${user.username} wants to start a private chat with you.`,
            conversationId: newConversation._id,
            notificationId: notification._id,
          });
        } else {
        }

        io.emit("privateConversationInvite", {
          conversationId: newConversation._id,
          fromUserId: userId,
          fromUsername: user.username,
          toUserId: targetUserId,
          toUsername: targetUser.username,
          message: `User ${user.username} wants to start a private chat with ${targetUser.username}`,
        });

        socket.emit("conversationStarted", {
          conversationId: newConversation._id,
          targetUserId,
          targetUsername: targetUser.username,
          message: `You started a conversation with user ${targetUser.username}`,
        });
      } catch (error) {
        console.error("Error starting private conversation:", error);
      }
    });

    socket.on(
      "sendConversationMessage",
      async ({ conversationId, message }) => {
        try {
          const conversation = await Conversation.findOne({
            _id: conversationId,
            participants: userId,
          });

          if (!conversation) {
            console.error(
              `User ${userId} not authorized for conversation ${conversationId}`
            );
            return;
          }

          const savedMessage = await chatController.saveMessage({
            content: message.content,
            sender: userId,
            room: conversationId,
          });

          const user = await User.findById(userId).select("username avatar");

          io.to(conversationId).emit("receiveConversationMessage", {
            _id: savedMessage._id,
            content: savedMessage.content,
            sender: {
              _id: user._id,
              username: user.username,
              avatar: user.avatar,
            },
            room: savedMessage.room,
            createdAt: savedMessage.createdAt,
          });
        } catch (error) {
          console.error(
            "Error saving and broadcasting conversation message:",
            error
          );
          socket.emit("conversationMessageError", { error: error.message });
        }
      }
    );

    socket.on("globalUpdate", () => {
      io.emit("globalUpdate");
    });

    socket.on("userRegistered", () => {
      console.log("Server received userRegistered event");
      socket.emit("registered", "I have registered");
      io.emit("newUserRegistered", "A new user has registered");
    });

    socket.on("messageLiked", async ({ messageId, likes }) => {
      try {
        const updatedMessage = await ChatMessage.findByIdAndUpdate(
          messageId,
          { likes },
          { new: true }
        );

        io.to(updatedMessage.room).emit("messageLiked", {
          messageId: updatedMessage._id,
          likes: updatedMessage.likes,
        });
      } catch (error) {
        console.error("Error updating message likes:", error);
      }
    });

    socket.on(
      "sendNotification",
      async ({ targetUserId, message, conversationId }) => {
        try {
          const sender = await User.findById(userId).select("username");
          const notification = new Notification({
            sender: userId,
            receiver: targetUserId,
            text: message,
            conversationId: conversationId,
          });
          await notification.save();

          const targetSocketId = users[targetUserId];
          if (targetSocketId) {
            io.to(targetSocketId).emit("newNotification", {
              message: message,
              conversationId: conversationId,
              notificationId: notification._id,
            });
          } else {
          }
        } catch (error) {
          console.error("Error sending notification:", error);
        }
      }
    );

    socket.on("disconnect", () => {
      delete users[userId];
    });
  });

  return io;
}

module.exports = setupSocket;
