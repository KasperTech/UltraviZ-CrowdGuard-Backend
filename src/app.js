const express = require('express')
const cors = require('cors')

const errorHandler = require('./middlewares/errorHandler.js')

const allowedOrigins = require('../src/constants/allowedOrigins')

const indexRoutes = require('./routes/index.js')

const app = express();

app.use(
    cors({
        origin: allowedOrigins,
        credentials: true,
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(express.static("/public"));

app.use("/api/v1", indexRoutes);

app.use(errorHandler);

module.exports = app