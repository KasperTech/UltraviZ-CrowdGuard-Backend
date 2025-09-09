const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io'); // Import Socket.IO
const allowedOrigins = require('./constants/allowedOrigins');
const errorHandler = require('./middlewares/errorHandler');
const indexRoutes = require('./routes/index');

const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO with CORS configuration
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Store the io instance in app for access in controllers
app.set('io', io);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1", indexRoutes);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);


  socket.on('alert', (data) => {
    io.emit('newAlert', JSON.stringify(data));

  });

  socket.on('count', (data) => {
    io.emit('countUpdate', JSON.stringify(data));
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

app.use(errorHandler);

module.exports = {
  httpServer,
  io
};