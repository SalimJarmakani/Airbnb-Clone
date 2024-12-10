const express = require("express");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");

const db = require(path.join(__dirname, "db", "dbOperations"));
const airbnbRoutes = require(path.join(__dirname, "routes", "airbnbRoutes"));
const config = require(path.join(__dirname, "config", "config"));

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Initialize the database
console.log("Connecting to MongoDB Atlas...");
//console.log("URI: ", config.dbURI);
db.initialize(config.dbURI);

// API routes
app.use("/api", airbnbRoutes);

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
