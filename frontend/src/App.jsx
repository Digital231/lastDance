import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Toolbar from "./components/Toolbar";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import AllUsers from "./pages/AllUsers";
import ChatRoom from "./pages/ChatRoom";
import Conversations from "./pages/Conversations";
import Home from "./pages/Home";
import Notifications from "./pages/Notifications";
import UserDetails from "./components/UserDetails";
import Conversation from "./components/Conversation";
import PrivateRoute from "./components/PrivateRoute";
import AuthWrapper from "./components/AuthWrapper";

function App() {
  return (
    <AuthWrapper>
      <Router>
        <Toolbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="/users"
            element={
              <PrivateRoute>
                <AllUsers />
              </PrivateRoute>
            }
          />
          <Route
            path="/chatroom"
            element={
              <PrivateRoute>
                <ChatRoom />
              </PrivateRoute>
            }
          />
          <Route
            path="/conversations"
            element={
              <PrivateRoute>
                <Conversations />
              </PrivateRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <PrivateRoute>
                <Notifications />
              </PrivateRoute>
            }
          />
          <Route
            path="/users/:userId"
            element={
              <PrivateRoute>
                <UserDetails />
              </PrivateRoute>
            }
          />
          <Route
            path="/conversations/:conversationId"
            element={
              <PrivateRoute>
                <Conversation />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </AuthWrapper>
  );
}

export default App;
