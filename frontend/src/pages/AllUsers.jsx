import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import useUserStore from "../stores/userStore";
import Loader from "../components/Loader";
import useSocket from "../hooks/useSocket";

function AllUsers() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { user, token } = useUserStore();
  const { socket } = useSocket();

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/users`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUsers(response.data);
      setFilteredUsers(response.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError(
        "An error occurred while fetching users. Please try again later."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  useEffect(() => {
    const results = users.filter((u) =>
      u.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(results);
  }, [searchTerm, users]);

  useEffect(() => {
    if (socket) {
      socket.on("newUserRegistered", (message) => {
        fetchUsers();
      });

      return () => {
        socket.off("newUserRegistered");
      };
    }
  }, [socket]);

  const handleUserClick = (clickedUser) => {
    const isCurrentUser =
      (user.id || user._id) === (clickedUser._id || clickedUser.id);
  };

  const isCurrentUser = (u) => (user.id || user._id) === (u._id || u.id);

  return (
    <div className="min-h-screen bg-base-200 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">All Users</h1>

        <div className="form-control mb-6">
          <div className="input-group">
            <input
              type="text"
              placeholder="Search users..."
              className="input input-bordered w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="btn btn-square">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </div>
        </div>

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

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader size="large" color="primary" />
          </div>
        ) : filteredUsers.length === 0 ? (
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
              <label>No users found.</label>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((u) => (
              <Link
                to={isCurrentUser(u) ? "/profile" : `/users/${u._id || u.id}`}
                key={u._id || u.id}
                className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow duration-300"
                onClick={() => handleUserClick(u)}
              >
                <figure className="px-10 pt-10">
                  <img
                    src={u.avatar || "https://via.placeholder.com/150"}
                    alt={u.username}
                    className="rounded-full w-24 h-24 object-cover"
                  />
                </figure>
                <div className="card-body items-center text-center">
                  <h2 className="card-title">
                    {u.username}
                    {isCurrentUser(u) && " (You)"}
                  </h2>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AllUsers;
