const express = require("express");
const loaders = require("./loaders");

async function createServer() {

  const app = express();

  // Init application loaders
  await loaders(app);

  return app;
}

module.exports = createServer;
