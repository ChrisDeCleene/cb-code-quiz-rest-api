const dotenv = require("dotenv");
// config() will read your .env file, parse the contents, assign it to process.env
dotenv.config();

module.exports = {
  // Add any variables from .env here for auto imports
  SESSION_SECRET: process.env.SESSION_SECRET,
};
