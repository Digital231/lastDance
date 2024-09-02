import { useEffect, useState, useRef } from "react";
import useSocket from "../hooks/useSocket";
import useUserStore from "../stores/userStore";
import axios from "axios";
import Loader from "../components/Loader";

const ChatRoom = () => {
  const { joinRoom, sendMessage, socket, currentRoom } = useSocket();
  const { user, token } = useUserStore();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (socket && currentRoom !== "chatRoom") {
      joinRoom("chatRoom");
    }
  }, [socket, joinRoom, currentRoom]);

  useEffect(() => {
    const fetchMessages = async () => {
      setIsLoading(true);
      try {
        const config = {
          headers: { Authorization: `Bearer ${token}` },
        };
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/chat/chatRoom`,
          config
        );
        setMessages(response.data);
        scrollToBottom();
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchMessages();
    }
  }, [token]);

  useEffect(() => {
    if (socket) {
      socket.on("receiveMessage", (newMessage) => {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        scrollToBottom();
      });

      socket.on("messageLiked", ({ messageId, likes }) => {
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg._id === messageId ? { ...msg, likes } : msg
          )
        );
      });
    }

    return () => {
      if (socket) {
        socket.off("receiveMessage");
        socket.off("messageLiked");
      }
    };
  }, [socket]);

  const handleSendMessage = () => {
    if (message.trim()) {
      sendMessage(message);
      setMessage("");
      scrollToBottom();
    }
  };

  const handleLike = async (messageId) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/chat/${messageId}/like`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      socket.emit("messageLiked", {
        messageId: messageId,
        likes: response.data.likes,
      });

      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg._id === messageId ? { ...msg, likes: response.data.likes } : msg
        )
      );
    } catch (error) {
      console.error("Error liking message:", error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex flex-col h-[93vh] bg-base-200">
      <div className="flex-grow overflow-hidden">
        <div className="container mx-auto px-4 py-8 h-full flex flex-col">
          <h1 className="text-3xl font-bold text-center mb-6 text-white">
            Chat Room
          </h1>
          <div className="bg-base-200 rounded-lg shadow-xl flex-grow flex flex-col overflow-hidden">
            <div
              className="flex-grow overflow-y-auto p-4"
              ref={chatContainerRef}
            >
              {isLoading ? (
                <div className="flex justify-center items-center h-full">
                  <Loader size="large" color="primary" />
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg._id}
                    className={`chat ${
                      msg.sender._id === user.id ? "chat-end" : "chat-start"
                    } mb-4`}
                  >
                    <div className="chat-image avatar">
                      <div className="w-10 rounded-full">
                        <img
                          src={
                            msg.sender.avatar ||
                            "https://via.placeholder.com/40"
                          }
                          alt={msg.sender.username}
                        />
                      </div>
                    </div>
                    <div className="chat-header mb-1 text-white">
                      {msg.sender.username}
                      <time className="text-xs opacity-50 ml-2">
                        {new Date(msg.createdAt).toLocaleString()}
                      </time>
                    </div>
                    <div className="chat-bubble relative break-words bg-white text-black">
                      {msg.content}
                      <div
                        className={`absolute ${
                          msg.sender._id === user.id
                            ? "-left-5 -bottom-2"
                            : "-right-5 -bottom-2"
                        } bg-black rounded-full p-1 shadow-md`}
                      >
                        <button
                          onClick={() => handleLike(msg._id)}
                          disabled={msg.sender._id === user.id}
                          className={`btn btn-circle btn-xs ${
                            msg.likes.includes(user.id)
                              ? "btn-primary"
                              : "btn-ghost"
                          }`}
                        >
                          {msg.likes.includes(user.id) ? "👎" : "👍"}
                        </button>
                      </div>
                    </div>

                    <div className="chat-footer mt-1">
                      <span
                        className={`badge ${
                          msg.likes.length > 0 ? "badge-primary" : "badge-ghost"
                        } badge-sm`}
                      >
                        {msg.likes.length}{" "}
                        {msg.likes.length === 1 ? "like" : "likes"}
                      </span>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-4 bg-base-200">
              <div className="flex">
                <input
                  type="text"
                  placeholder="Type your message..."
                  className="input input-bordered flex-grow mr-2 bg-white text-black"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                />
                <button className="btn btn-primary" onClick={handleSendMessage}>
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;
