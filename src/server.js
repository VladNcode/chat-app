require('dotenv').config({ path: './config.env' });
const app = require('./app');
const http = require('http');
const socketio = require('socket.io');

process.on('uncaughtException', err => {
  console.log(err.name, err.message);
  console.log('UNCAUGHT EXCEPTION 💥 REJECTED REJECTED REJECTED');
  process.exit(1);
});

const server = http.createServer(app);
const io = socketio(server);

//! io.emit === translate to everyone
//! socket.broadcast.emit === translate to everyone except current user
//! socket.emit === translate to current user

io.on('connection', socket => {
  io.emit('server share user connected');
  socket.emit('welcome joined user from the server');

  socket.on('user have chosen a nickname', userName => {
    socket.username = userName;
    console.log(`${socket.username} connected`);
    socket.broadcast.emit('server share user connected', userName);
    socket.emit('you have entered the room');
  });

  socket.on('client location recieved', data => {
    socket.broadcast.emit('server share location', {
      data,
      user: socket.username,
    });
  });

  socket.on('client message recieved', msg => {
    io.emit('server share message', msg);
  });

  socket.on('disconnect', () => {
    if (socket.username) console.log(`${socket.username} disconnected`);
    socket.broadcast.emit('server share user disconnected', socket.username);
  });
});

const port = process.env.PORT || 3000;
server.listen(port, (req, res) => {
  console.log(`Listening at port ${port}`);
  console.log(`Currently in: ${process.env.NODE_ENV}`);
});

process.on('unhandledRejection', err => {
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION 💥 REJECTED REJECTED REJECTED');
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    console.log('💥 Process terminated');
  });
});
