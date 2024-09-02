import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import useUserStore from "../stores/userStore";
import useSocket from "../hooks/useSocket";
import Loader from "../components/Loader";

function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useUserStore();
  const { socket, globalUpdateTrigger } = useSocket();
  const navigate = useNavigate();

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        "http://localhost:5000/api/notifications",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setNotifications(response.data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    fetchNotifications();
  }, [globalUpdateTrigger, fetchNotifications]);

  useEffect(() => {
    if (socket) {
      const handleNewNotification = (data) => {
        setNotifications((prevNotifications) => [data, ...prevNotifications]);
      };

      socket.on("newNotification", handleNewNotification);

      return () => {
        socket.off("newNotification", handleNewNotification);
      };
    }
  }, [socket]);

  const handleDelete = async (notificationId) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/notifications/${notificationId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setNotifications(
        notifications.filter((notif) => notif._id !== notificationId)
      );
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await axios.put(
        `http://localhost:5000/api/notifications/${notificationId}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setNotifications(
        notifications.map((notif) =>
          notif._id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleNotificationClick = (notification) => {
    if (notification.conversationId) {
      navigate(`/conversations/${notification.conversationId}`);
    }
    if (!notification.isRead) {
      handleMarkAsRead(notification._id);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Notifications</h1>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader size="large" color="primary" />
          </div>
        ) : notifications.length === 0 ? (
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
              <label>No notifications</label>
            </div>
          </div>
        ) : (
          <ul className="space-y-4">
            {notifications.map((notification) => (
              <li
                key={notification._id}
                className={`card bg-base-100 shadow-xl ${
                  !notification.isRead ? "border-l-4 border-primary" : ""
                }`}
              >
                <div className="card-body p-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start">
                    <div
                      className="cursor-pointer flex-grow"
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <h2
                        className={`card-title text-base sm:text-lg ${
                          !notification.isRead ? "text-primary" : ""
                        }`}
                      >
                        {notification.text}
                      </h2>
                      <p className="text-xs sm:text-sm opacity-70 mt-1">
                        {new Date(notification.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex flex-wrap justify-end gap-2 mt-2 sm:mt-0">
                      {!notification.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(notification._id)}
                          className="btn btn-xs sm:btn-sm btn-ghost"
                        >
                          Mark as Read
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(notification._id)}
                        className="btn btn-xs sm:btn-sm btn-error"
                      >
                        Delete
                      </button>
                    </div>
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

export default NotificationsPage;
