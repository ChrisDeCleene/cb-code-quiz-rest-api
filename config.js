const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  // Add any variables from .env here for auto imports
  MONGO_URL: process.env.MONGODB_CONNECTION_STRING,
  MONGO_TEST_URL: process.env.MONGODB_TEST_STRING,
  SESSION_SECRET: process.env.SESSION_SECRET,
};
