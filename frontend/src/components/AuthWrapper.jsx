import { useEffect } from "react";
import useUserStore from "../stores/userStore";

const AuthWrapper = ({ children }) => {
  const { isLoggedIn, setUser, setToken } = useUserStore();

  useEffect(() => {
    if (!isLoggedIn) {
      try {
        const storedUser = localStorage.getItem("user-storage");
        if (storedUser) {
          const parsedData = JSON.parse(storedUser);
          if (
            parsedData &&
            parsedData.state &&
            parsedData.state.user &&
            parsedData.state.token
          ) {
            setUser(parsedData.state.user);
            setToken(parsedData.state.token);
          }
        }
      } catch (error) {
        console.error("Error parsing stored user data:", error);
        localStorage.removeItem("user-storage");
      }
    }
  }, [isLoggedIn, setUser, setToken]);

  return <>{children}</>;
};

export default AuthWrapper;
