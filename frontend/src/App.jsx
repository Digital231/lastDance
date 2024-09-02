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

function App() {
  return (
    <Router>
      <Toolbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/users" element={<AllUsers />} />
        <Route path="/chatroom" element={<ChatRoom />} />
        <Route path="/conversations" element={<Conversations />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/users/:userId" element={<UserDetails />} />
        <Route
          path="/conversations/:conversationId"
          element={<Conversation />}
        />
      </Routes>
    </Router>
  );
}

export default App;
