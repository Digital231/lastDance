const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.sendStatus(403);
    }

    if (!decoded.user || !decoded.user.id) {
      return res.sendStatus(403);
    }

    req.user = decoded.user;

    next();
  });
};

module.exports = authMiddleware;
