import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import useUserStore from "../stores/userStore";
import useSocket from "../hooks/useSocket";
import { format } from "date-fns";

function Conversation() {
  const [messages, setMessages] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [error, setError] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showAddUsers, setShowAddUsers] = useState(false);
  const { conversationId } = useParams();
  const { token, user: currentUser } = useUserStore();
  const { socket, joinRoom, sendConversationMessage, emitGlobalUpdate } =
    useSocket();
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const fetchConversation = useCallback(async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/conversations/${conversationId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (
        response.data.conversation &&
        Array.isArray(response.data.conversation.participants)
      ) {
        setParticipants(response.data.conversation.participants);
      } else {
        console.error(
          "Participants data is not in the expected format:",
          response.data
        );
        setParticipants([]);
      }

      if (Array.isArray(response.data.messages)) {
        setMessages(response.data.messages);
      } else {
        console.error(
          "Messages data is not in the expected format:",
          response.data
        );
        setMessages([]);
      }

      setError(null);
    } catch (error) {
      console.error("Error fetching conversation:", error);
      if (error.response && error.response.status === 404) {
        setError("Conversation not found, navigating back");
        setTimeout(() => {
          navigate("/conversations");
        }, 2000);
      } else {
        setError("An error occurred while fetching the conversation");
      }
    }
  }, [conversationId, token]);

  const fetchAllUsers = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/users`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAllUsers(response.data);
    } catch (error) {
      console.error("Error fetching all users:", error);
      setError("Failed to fetch users. Please try again.");
    }
  };

  useEffect(() => {
    fetchConversation();
    fetchAllUsers();
    if (socket && conversationId) {
      joinRoom(conversationId);
    }
  }, [conversationId, token, socket, joinRoom, fetchConversation]);

  useEffect(() => {
    if (socket) {
      const handleReceiveConversationMessage = (message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
      };

      const handleConversationMessageError = (error) => {
        console.error("Conversation message error:", error);
        setError(`Error sending message: ${error.error}`);
      };

      socket.on("receiveConversationMessage", handleReceiveConversationMessage);
      socket.on("conversationMessageError", handleConversationMessageError);

      return () => {
        socket.off(
          "receiveConversationMessage",
          handleReceiveConversationMessage
        );
        socket.off("conversationMessageError", handleConversationMessageError);
      };
    }
  }, [socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      try {
        const response = await axios.post(
          `${
            import.meta.env.VITE_API_URL
          }/conversations/${conversationId}/messages`,
          { content: newMessage },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        sendConversationMessage(conversationId, {
          content: newMessage,
          sender: {
            _id: currentUser._id,
            username: currentUser.username,
            avatar: currentUser.avatar,
          },
        });

        setNewMessage("");
        setError(null);
      } catch (error) {
        console.error("Error sending message:", error);
        setError("Conversation was deleted, navigating back");
        setTimeout(() => {
          navigate("/conversations");
        }, 2000);
      }
    }
  };

  const addUserToConversation = async (userId) => {
    try {
      const response = await axios.post(
        `${
          import.meta.env.VITE_API_URL
        }/conversations/${conversationId}/participants`,
        { userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      emitGlobalUpdate();

      if (socket) {
        socket.emit("sendNotification", {
          targetUserId: userId,
          message: `You have been added to a conversation by ${currentUser.username}`,
          conversationId: conversationId,
        });
      }

      fetchConversation();
      setShowAddUsers(false);
    } catch (error) {
      console.error("Error adding user to conversation:", error);
      setError("Failed to add user to conversation. Please try again.");
    }
  };

  return (
    <div className="flex flex-col h-[93vh] bg-base-200">
      <div className="bg-base-200 p-4 shadow-md">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Conversation</h1>

          <div className="relative">
            <div className="lg:hidden">
              {/* Hamburger button */}
              <button
                className="text-white"
                onClick={() => setShowMenu(!showMenu)}
              >
                &#9776; {/* Hamburger icon */}
              </button>
            </div>
            <div className="hidden lg:flex space-x-2">
              <button
                className="btn btn-primary"
                onClick={() => setShowParticipants(true)}
              >
                Show Participants
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setShowAddUsers(true)}
              >
                Add Users
              </button>
            </div>
            {/* Dropdown menu for mobile */}
            {showMenu && (
              <div className="absolute right-0 mt-2 py-2 w-48 bg-white rounded-lg shadow-xl z-20 lg:hidden">
                <button
                  className="block w-full text-left px-4 py-2 text-sm text-black hover:bg-gray-200"
                  onClick={() => {
                    setShowParticipants(true);
                    setShowMenu(false);
                  }}
                >
                  Show Participants
                </button>
                <button
                  className="block w-full text-left px-4 py-2 text-sm text-black hover:bg-gray-200"
                  onClick={() => {
                    setShowAddUsers(true);
                    setShowMenu(false);
                  }}
                >
                  Add Users
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {error && <div className="bg-error text-error-content p-2">{error}</div>}

      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isCurrentUser = message.sender._id === currentUser.id;
          const createdAt = message.createdAt;
          const formattedDate = createdAt
            ? format(new Date(createdAt), "MMM d, yyyy h:mm a")
            : "Unknown date";

          return (
            <div
              key={message._id}
              className={`flex ${
                isCurrentUser ? "justify-start" : "justify-end"
              } ms-15`}
            >
              <div
                className={`flex items-start max-w-full ${
                  isCurrentUser ? "flex-row" : "flex-row-reverse"
                }`}
              >
                <img
                  src={message.sender.avatar}
                  alt={`${message.sender.username}'s avatar`}
                  className="w-10 h-10 rounded-full flex-shrink-0"
                />
                <div
                  className={`flex flex-col ${
                    isCurrentUser ? "items-start" : "items-end"
                  } ml-3 mr-3`}
                >
                  <span className="font-bold text-sm mb-1 text-white">
                    {message.sender.username}
                  </span>
                  <span className="text-xs text-gray-500 mb-2">
                    {formattedDate}
                  </span>
                  <div
                    className={`chat-bubble p-3 rounded-lg break-words bg-white text-black max-w-[calc(100vw-6rem)] ${
                      isCurrentUser ? "rounded-tr-none" : "rounded-tl-none"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-base-200 p-4">
        <div className="flex">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="input input-bordered flex-grow placeholder-gray-500 bg-white text-black"
            placeholder="Type a message..."
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          />
          <button onClick={handleSendMessage} className="btn btn-primary ml-2">
            Send
          </button>
        </div>
      </div>

      {showParticipants && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Participants</h3>
            {participants && participants.length > 0 ? (
              <ul>
                {participants.map((participant) => (
                  <li key={participant._id} className="mb-2">
                    {participant.username}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No participants to display.</p>
            )}
            <div className="modal-action">
              <button
                className="btn"
                onClick={() => setShowParticipants(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddUsers && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">
              Add Users to Conversation
            </h3>
            {allUsers && allUsers.length > 0 && participants ? (
              <ul>
                {allUsers
                  .filter(
                    (u) =>
                      !participants.some((p) => p._id === u._id) &&
                      u._id !== currentUser._id
                  )
                  .map((u) => (
                    <li
                      key={u._id}
                      className="mb-2 flex justify-between items-center"
                    >
                      {u.username}
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => addUserToConversation(u._id)}
                      >
                        Add
                      </button>
                    </li>
                  ))}
              </ul>
            ) : (
              <p>No users available to add.</p>
            )}
            <div className="modal-action">
              <button className="btn" onClick={() => setShowAddUsers(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Conversation;
