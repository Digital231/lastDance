import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import useUserStore from "../stores/userStore";
import useSocket from "../hooks/useSocket";

function Conversations() {
  const [conversations, setConversations] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { token, user: currentUser } = useUserStore();
  const { globalUpdateTrigger, emitGlobalUpdate } = useSocket();

  const fetchConversations = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/conversations`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setConversations(response.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching conversations:", error.response || error);
      setError("An error occurred while fetching conversations");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations, globalUpdateTrigger]);

  const handleDeleteConversation = async (conversationId) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/conversations/${conversationId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      emitGlobalUpdate();
    } catch (error) {
      console.error("Error deleting conversation:", error);
      setError(
        `An error occurred while deleting the conversation: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  return (
    <div className="min-h-screen bg-base-200 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Your Conversations</h1>
        {error && (
          <div className="alert alert-error mb-4">
            <div className="flex-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="w-6 h-6 mx-2 stroke-current"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                ></path>
              </svg>
              <label>{error}</label>
            </div>
          </div>
        )}
        {conversations.length === 0 ? (
          <div className="alert alert-info">
            <div className="flex-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="w-6 h-6 mx-2 stroke-current"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <label>You have no conversations yet.</label>
            </div>
          </div>
        ) : (
          <ul className="space-y-4">
            {conversations.map((conversation) => (
              <li key={conversation._id} className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <Link
                    to={`/conversations/${conversation._id}`}
                    className="block"
                  >
                    <h2 className="card-title">
                      Conversation with:{" "}
                      {conversation.participants
                        .filter((p) => p._id !== currentUser._id)
                        .map((p) => p.username)
                        .join(", ")}
                    </h2>
                    <p className="text-sm opacity-70">
                      Last updated:{" "}
                      {new Date(conversation.updatedAt).toLocaleString()}
                    </p>
                  </Link>
                  <div className="card-actions justify-end mt-4">
                    <button
                      onClick={() => handleDeleteConversation(conversation._id)}
                      className="btn btn-sm btn-error"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Conversations;
