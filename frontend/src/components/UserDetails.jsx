import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import useUserStore from "../stores/userStore";
import useSocket from "../hooks/useSocket";

function UserDetails() {
  const [user, setUser] = useState(null);
  const { userId } = useParams();
  const { token, user: currentUser } = useUserStore();
  const { socket } = useSocket();
  const { globalUpdateTrigger, emitGlobalUpdate } = useSocket();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/users/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    fetchUserDetails();
  }, [userId, token, globalUpdateTrigger]);

  useEffect(() => {
    if (socket) {
      socket.on("newNotification", () => {
        emitGlobalUpdate();
      });

      socket.on("conversationStarted", ({ conversationId }) => {
        emitGlobalUpdate();
        navigate(`/conversations/${conversationId}`);
      });
    }

    return () => {
      if (socket) {
        socket.off("newNotification");
        socket.off("conversationStarted");
      }
    };
  }, [socket, currentUser, navigate, emitGlobalUpdate]);

  const handleStartConversation = () => {
    if (socket && user) {
      socket.emit("startPrivateConversation", { targetUserId: user._id });
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="flex justify-center items-center min-h-screen bg-base-200">
      <div className="card w-96 bg-base-100 shadow-xl">
        <figure className="px-10 pt-10">
          <img
            src={user.avatar}
            alt={user.username}
            className="rounded-xl w-32 h-32 object-cover"
          />
        </figure>
        <div className="card-body items-center text-center">
          <h2 className="card-title text-2xl">{user.username}</h2>
          {currentUser._id !== user._id && (
            <button
              className="btn btn-primary mt-4"
              onClick={handleStartConversation}
            >
              Start Conversation
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserDetails;
