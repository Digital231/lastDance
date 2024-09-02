import { Navigate } from "react-router-dom";
import useUserStore from "../stores/userStore";

const PrivateRoute = ({ children }) => {
  const { isLoggedIn } = useUserStore();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;
