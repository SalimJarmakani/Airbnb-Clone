const jwt = require("jsonwebtoken");
const path = require("path");
const User = require(path.join(__dirname, "..", "models", "User"));
const config = require(path.join(__dirname, "..", "config", "config"));

function authenticateToken(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Access denied" });

  jwt.verify(token, config.jwtSecret, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = user;
    next();
  });
}

function authorizeRole(role) {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    next();
  };
}

function checkApiKey(req, res, next) {
  const apiKey = req.query.apiKey || req.headers["x-api-key"];
  if (!apiKey) return res.status(401).json({ message: "API key required" });

  User.findOne({ apiKey }, (err, user) => {
    if (err || !user)
      return res.status(403).json({ message: "Invalid API key" });
    req.user = user;
    next();
  });
}

module.exports = { authenticateToken, authorizeRole, checkApiKey };
