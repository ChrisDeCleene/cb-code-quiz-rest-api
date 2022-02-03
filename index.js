const mongoose = require("mongoose");
const createServer = require("./server");
const PORT = process.env.PORT || 5000;

const { MONGO_URL } = require("./config");

mongoose.connect(MONGO_URL, { useNewUrlParser: true }).then(async () => {
  const app = await createServer();
  // Start server
  app.listen(PORT, () => {
    console.log("Server listening on http://localhost:" + PORT);
  });
});
