require('dotenv').config({ path: './config.env' });
const app = require('./app');
const http = require('http');
const socketio = require('socket.io');
const Filter = require('bad-words');

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
  io.emit('message', 'entered the room');
  socket.emit('welcome joined user from the server');

  socket.on('user have chosen a nickname', userName => {
    socket.username = userName;
    console.log(`${socket.username} connected`);
    socket.broadcast.emit('message', `${userName} has joined a room 👋`);
    socket.emit('message', 'You have joined a room');
  });

  socket.on('client location recieved', data => {
    socket.broadcast.emit(
      'message',
      `${socket.username} shared his location: https://google.com/maps?q=${data.lat},${data.lng}`
    );
  });

  socket.on('client message recieved', (msg, callback) => {
    const filter = new Filter();
    if (filter.isProfane(msg)) {
      return callback('Profanity is not allowed!');
    }

    io.emit('server share message', msg);
    callback('Delivered!');
  });

  socket.on('disconnect', () => {
    if (socket.username) console.log(`${socket.username} disconnected`);
    socket.broadcast.emit('message', `${socket.username} left the room 👋`);
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
