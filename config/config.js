const dotenv = require("dotenv");

// Load environment variables from the .env file
dotenv.config();

module.exports = {
  dbURI: process.env.MONGODB_URI || "mongodb://localhost:27017/defaultDatabase",
  JWT_SECRET: process.env.JWT_SECRET,
  ADMIN_INVITE_CODE: process.env.ADMIN_INVITE_CODE,
};
