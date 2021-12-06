require('dotenv').config({ path: './config.env' });
const app = require('./app');
const http = require('http');
const socketio = require('socket.io');
const Filter = require('bad-words');

const { generateMessage } = require('./utils/messages');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users');

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
  socket.on('join', ({ name, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, name, room });
    if (error) return callback(error);

    socket.emit('welcome joined user from the server', { user });

    socket.broadcast.to(user.room).emit('message', {
      ...generateMessage(`${user.name} has joined a room ${user.room} 👋`),
      user: 'Server',
    });

    socket.emit('message', {
      ...generateMessage(`You joined a room ${user.room} 👋`),
      user: 'Server',
    });

    socket.join(user.room);

    io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });

    // callback('You joined a room successfully');
  });

  socket.on('client location recieved', (data, callback) => {
    socket.broadcast.emit('server share location', {
      user: data.user,
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

    const user = getUser(socket.id);
    io.to(user.room).emit('message', {
      ...generateMessage(msg),
      user: user.name,
    });

    callback('Delivered!');
  });

  socket.on('disconnect', () => {
    const user = removeUser(socket.id);

    if (user) {
      console.log(`${user.name} disconnected`);

      io.to(user.room).emit('message', {
        ...generateMessage(`${user.name} left the room 👋`),
        user: 'Server',
      });

      io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });
    }
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
