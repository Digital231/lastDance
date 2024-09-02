import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import useUserStore from "../stores/userStore";
import useSocket from "../hooks/useSocket";
import axios from "axios";

const Toolbar = () => {
  const {
    isLoggedIn,
    logout,
    token,
    hasNewNotifications,
    setHasNewNotifications,
  } = useUserStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { globalUpdateTrigger } = useSocket();

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (isLoggedIn && token) {
      checkForNewNotifications();
    }
  }, [isLoggedIn, token, globalUpdateTrigger]);

  useEffect(() => {
    if (location.pathname === "/notifications") {
      setHasNewNotifications(false);
    }
  }, [location, setHasNewNotifications]);

  const checkForNewNotifications = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/notifications`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setHasNewNotifications(response.data.some((notif) => !notif.isRead));
    } catch (error) {
      console.error("Error checking for new notifications:", error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const NavItems = ({ className = "" }) => (
    <ul className={`menu ${className}`}>
      {isLoggedIn ? (
        <>
          <li>
            <Link to="/chatroom">Chatroom</Link>
          </li>
          <li>
            <Link to="/users">All Users</Link>
          </li>
          <li>
            <Link to="/conversations">Conversations</Link>
          </li>
          <li>
            <Link to="/notifications" className="relative">
              Notifications
              {hasNewNotifications &&
                location.pathname !== "/notifications" && (
                  <span className="badge badge-sm badge-warning absolute -top-2 -right-2">
                    New
                  </span>
                )}
            </Link>
          </li>
          <li>
            <Link to="/profile">Profile</Link>
          </li>
          <li>
            <button onClick={handleLogout}>Logout</button>
          </li>
        </>
      ) : (
        <>
          <li>
            <Link to="/register">Register</Link>
          </li>
          <li>
            <Link to="/login">Login</Link>
          </li>
        </>
      )}
    </ul>
  );

  return (
    <div className="sticky top-0 z-50">
      <div className="navbar bg-base-100 shadow-lg">
        <div className="navbar-start">
          <div className="dropdown">
            <label
              tabIndex={0}
              className="btn btn-ghost lg:hidden relative z-20"
              onClick={toggleMenu}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h8m-8 6h16"
                />
              </svg>
            </label>
            {isMenuOpen && (
              <NavItems className="dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52 z-30 relative" />
            )}
          </div>
          <Link to="/" className="btn btn-ghost normal-case text-xl">
            BoringApp
          </Link>
        </div>
        <div className="navbar-center hidden lg:flex">
          <NavItems className="menu-horizontal px-1" />
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
