import { useState, useEffect } from "react";
import useUserStore from "../stores/userStore";
import useSocket from "../hooks/useSocket";
import axios from "axios";

const Profile = () => {
  const { user, token, updateUser } = useUserStore();
  const { emitGlobalUpdate } = useSocket();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updateData, setUpdateData] = useState({
    username: "",
    avatar: "",
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setUpdateData((prevData) => ({
        ...prevData,
        username: user.username,
        avatar: user.avatar || "",
      }));
    }
  }, [user]);

  const handleInputChange = (e) => {
    setUpdateData({ ...updateData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const dataToUpdate = {};
      if (updateData.username !== user.username)
        dataToUpdate.username = updateData.username;
      if (updateData.avatar !== user.avatar)
        dataToUpdate.avatar = updateData.avatar;
      if (updateData.currentPassword) {
        dataToUpdate.currentPassword = updateData.currentPassword;
        dataToUpdate.newPassword = updateData.newPassword;
        dataToUpdate.confirmNewPassword = updateData.confirmNewPassword;
      }

      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/users/update`,
        dataToUpdate,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      updateUser(response.data);
      emitGlobalUpdate();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Update error:", error.response?.data || error.message);
      const errorMsg =
        error.response?.data?.errors?.map((err) => err.msg).join(", ") ||
        error.response?.data?.message ||
        "An error occurred during update";
      setError(errorMsg);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-base-200">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Profile Not Available</h1>
          <p className="text-xl">Please login to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 p-8">
      <div className="max-w-4xl mx-auto bg-base-100 rounded-box shadow-xl p-8">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="text-center md:text-left mb-6 md:mb-0">
            <h1 className="text-4xl font-bold mb-2">
              Welcome, {user.username}!
            </h1>

            <p className="text-xl text-base-content/70">
              Your personal dashboard
            </p>
          </div>
          <img
            src={user.avatar || "https://via.placeholder.com/150"}
            alt="User avatar"
            className="w-32 h-32 rounded-full border-4 border-primary"
          />
        </div>

        <div className="mt-8">
          <button
            className="btn btn-primary btn-lg w-full sm:w-auto"
            onClick={() => setIsModalOpen(true)}
          >
            Update Profile
          </button>
        </div>

        {isModalOpen && (
          <div className="modal modal-open">
            <div className="modal-box w-11/12 max-w-2xl">
              <h3 className="font-bold text-2xl mb-6">Update Profile</h3>
              <form onSubmit={handleUpdate}>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Username</span>
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={updateData.username}
                    onChange={handleInputChange}
                    className="input input-bordered"
                  />
                </div>
                <div className="form-control mt-4">
                  <label className="label">
                    <span className="label-text">Avatar URL</span>
                  </label>
                  <input
                    type="url"
                    name="avatar"
                    value={updateData.avatar}
                    onChange={handleInputChange}
                    className="input input-bordered"
                  />
                </div>
                <div className="form-control mt-4">
                  <label className="label">
                    <span className="label-text">Current Password</span>
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={updateData.currentPassword}
                    onChange={handleInputChange}
                    className="input input-bordered"
                  />
                </div>
                <div className="form-control mt-4">
                  <label className="label">
                    <span className="label-text">New Password</span>
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={updateData.newPassword}
                    onChange={handleInputChange}
                    className="input input-bordered"
                  />
                </div>
                <div className="form-control mt-4">
                  <label className="label">
                    <span className="label-text">Confirm New Password</span>
                  </label>
                  <input
                    type="password"
                    name="confirmNewPassword"
                    value={updateData.confirmNewPassword}
                    onChange={handleInputChange}
                    className="input input-bordered"
                  />
                </div>
                {error && <p className="text-error mt-4">{error}</p>}
                <div className="modal-action mt-6">
                  <button type="submit" className="btn btn-primary">
                    Update
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
