const dotenv = require('dotenv')
const app = require('./src/app.js')
const connectToDb = require('./src/db/connectToDb.js')
const { httpServer } = require('./src/app.js')


dotenv.config({
  path: ".env",
});


const port = process.env.PORT || 5050;

connectToDb();

httpServer.listen(port, () => {
  console.log(
    `Server is started on port :${port} in ${
      process.env.NODE_ENV
    } mode at ${new Date().toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata",
    })} ${new Date().toLocaleTimeString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour12: false,
    })}`
  );
});