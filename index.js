const dotenv = require('dotenv')
const app = require('./src/app.js')
const connectToDb = require('./src/db/connectToDb.js')


dotenv.config({
  path: ".env",
});


const port = process.env.PORT;

connectToDb()
  .then(() => {
    app.on("error", () => {
      console.log("Server Error: ", error);
      process.exit(1);
    });
    app.listen(port, () => {
      console.log(`Server started on port: ${port}`);
    });
  })
  .catch((error) => {
    console.log("MongoDB failed to connect ", error);
  });