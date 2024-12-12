const express = require("express");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const passport = require("passport");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const crypto = require("crypto");
const db = require(path.join(__dirname, "db", "dbOperations"));
const airbnbRoutes = require(path.join(__dirname, "routes", "airbnbRoutes"));
const authRoutes = require(path.join(__dirname, "routes", "authRoutes"));
const config = require(path.join(__dirname, "config", "config"));
require(path.join(__dirname, "config", "passport"));
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Routes
app.use("/auth", authRoutes);
app.use("/api", airbnbRoutes);

// Initialize the database
console.log("Connecting to MongoDB Atlas...");
console.log("URI: ", config.dbURI);
db.initialize(config.dbURI);

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
