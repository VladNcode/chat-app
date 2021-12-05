require('dotenv').config({ path: './config.env' });
const app = require('./app');
const http = require('http');
const socketio = require('socket.io');
const Filter = require('bad-words');

const { generateMessage } = require('./utils/messages');

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

//! io.to.emit === emits event to everybody in a specific room
//! socket.broadcast.to.emit === emits event to everyone except current user (limited to room)

io.on('connection', socket => {
  socket.on('user have chosen a nickname', ({ user, room }) => {
    socket.emit('welcome joined user from the server');

    socket.join(room);
    socket.username = user;
    console.log(`${socket.username} connected`);

    io.to(room).emit('message', {
      ...generateMessage(`${user} has joined a room 👋`),
      user: 'Server',
    });

    // socket.broadcast.emit('message', {
    //   ...generateMessage(`${user} has joined a room 👋`),
    //   user: 'Server',
    // });

    // socket.emit('message', { ...generateMessage('You have joined a room'), user: 'Server' });
  });

  socket.on('client location recieved', (data, callback) => {
    socket.broadcast.emit('server share location', {
      user: socket.username,
      loc: `https://google.com/maps?q=${data.lat},${data.lng}`,
      createdAt: new Date().getTime(),
    });

    callback('Server shared location!');
  });

  socket.on('client message recieved', (msg, callback) => {
    const filter = new Filter();
    // if (filter.isProfane(msg)) {
    //   return callback('Profanity is not allowed!');
    // }

    msg = filter.clean(msg);

    io.emit('message', { ...generateMessage(msg), user: socket.username });
    callback('Delivered!');
  });

  socket.on('disconnect', () => {
    if (socket.username) console.log(`${socket.username} disconnected`);
    socket.broadcast.emit('message', {
      ...generateMessage(`${socket.username} left the room 👋`),
      user: socket.username,
    });
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
