const express = require("express");
const app = express();

const loaders = require("./loaders");

const PORT = process.env.PORT || 4000;

async function startServer() {
  // Init application loaders
  loaders(app);

  // Start server
  app.listen(PORT, () => {
    console.log("Server listening on http://localhost:" + PORT);
  });
}
startServer();

module.exports = app;
