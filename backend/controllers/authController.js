const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");

const createToken = (userId) => {
  const payload = {
    user: { id: userId },
  };
  return jwt.sign(payload, process.env.JWT_SECRET);
};

const handleErrors = (res, error) => {
  console.error("Auth Error:", error);
  res
    .status(500)
    .json({ errors: [{ msg: "Server error. Please try again later." }] });
};

const validateRequest = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return false;
  }
  return true;
};

const sendUserResponse = (res, user, token, statusCode = 200) => {
  res.status(statusCode).json({
    token,
    user: {
      id: user.id,
      username: user.username,
      avatar: user.avatar,
    },
  });
};

exports.register = async (req, res) => {
  if (!validateRequest(req, res)) return;
  const { username, password } = req.body;
  try {
    let user = await User.findOne({ username });
    if (user) {
      return res
        .status(400)
        .json({ errors: [{ msg: "Username already exists" }] });
    }
    user = new User({ username, password });
    await user.save();

    const token = createToken(user.id);
    sendUserResponse(res, user, token, 201);

    const io = req.app.get("socketio");
    io.emit("newUserRegistered", `User ${username} has registered.`);
  } catch (err) {
    handleErrors(res, err);
  }
};

exports.login = async (req, res) => {
  if (!validateRequest(req, res)) return;
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ errors: [{ msg: "Bad credentials" }] });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ errors: [{ msg: "Bad credentials" }] });
    }
    const token = createToken(user.id);
    sendUserResponse(res, user, token);
  } catch (err) {
    handleErrors(res, err);
  }
};
