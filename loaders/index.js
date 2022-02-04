const expressLoader = require("./express");
const routesLoader = require("../routes");
const swaggerLoader = require("./swagger");
const errorhandler = require("errorhandler");

// Connect app to exppress, passport, and all routes here
module.exports = async (app) => {
  // Load Express middlewares
  await expressLoader(app);

  // TODO Load Passport middleware (use returned app from express)

  // Load API route handlers
  await routesLoader(app);

  //TODO Load Swagger
  swaggerLoader(app);

  // Error handler
  app.use(errorhandler());
};