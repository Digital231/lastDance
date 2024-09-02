import { useEffect, useState, useCallback } from "react";
import io from "socket.io-client";
import useUserStore from "../stores/userStore";

const useSocket = () => {
  const [socket, setSocket] = useState(null);
  const { token, user, setHasNewNotifications } = useUserStore();
  const [currentRoom, setCurrentRoom] = useState(null);
  const [globalUpdateTrigger, setGlobalUpdateTrigger] = useState(0);

  const localHost = "http://localhost:5000";
  const prodHost = "https://lastdance.onrender.com";

  useEffect(() => {
    let newSocket;
    if (token && user) {
      newSocket = io(prodHost, {
        query: { token },
      });
      setSocket(newSocket);

      newSocket.on("connect", () => {
        console.log("Connected to socket");
      });

      newSocket.on("receiveMessage", (data) => {});

      newSocket.on("globalUpdate", () => {
        setGlobalUpdateTrigger((prev) => prev + 1);
      });

      newSocket.on("receiveGlobalMessage", (data) => {});

      newSocket.on("newNotification", (notification) => {
        setHasNewNotifications(true);
        setGlobalUpdateTrigger((prev) => prev + 1);
      });

      newSocket.on("registered", (message) => {
        console.log(message);
      });

      newSocket.on("newUserRegistered", (message) => {
        console.log(message);
      });
    }

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [token, user, setHasNewNotifications]);

  const joinRoom = useCallback(
    (room) => {
      if (socket) {
        if (currentRoom) {
          socket.emit("leaveRoom", currentRoom);
        }
        socket.emit("joinRoom", room);
        setCurrentRoom(room);
      }
    },
    [socket, currentRoom]
  );

  const sendMessage = useCallback(
    (message) => {
      if (socket && currentRoom) {
        socket.emit("sendMessage", { room: currentRoom, message });
      }
    },
    [socket, currentRoom]
  );

  const sendConversationMessage = useCallback(
    (conversationId, message) => {
      if (socket) {
        socket.emit("sendConversationMessage", { conversationId, message });
      }
    },
    [socket]
  );

  const sendGlobalMessage = useCallback(
    (message) => {
      if (socket) {
        socket.emit("sendGlobalMessage", { message });
      }
    },
    [socket]
  );

  const emitGlobalUpdate = useCallback(() => {
    if (socket) {
      socket.emit("globalUpdate");
    }
  }, [socket]);

  return {
    socket,
    joinRoom,
    sendMessage,
    sendGlobalMessage,
    sendConversationMessage,
    globalUpdateTrigger,
    emitGlobalUpdate,
    currentRoom,
  };
};

export default useSocket;
