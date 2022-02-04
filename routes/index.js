// Connect all routes here
const questionsRouter = require("./question");

module.exports = async (app) => {
  // Set up each route with proper endpoint like ex below
  // app.use('/auth', AuthRouter)
  questionsRouter(app);
};
