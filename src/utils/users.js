// addUser, removeUser, getUser, getUsersInRoom

const users = [];

const addUser = ({ id, name, room }) => {
  name = name.trim().toLowerCase();
  room = room.trim().toLowerCase();

  if (!name || !room) return { error: 'Please select a name and a room' };

  const existingUser = users.find(user => user.name === name && user.room === room);
  if (existingUser) return { error: 'Username is already in use by another user' };

  const user = { id, name, room };
  users.push(user);
  return { user };
};

const removeUser = id => {
  const index = users.findIndex(user => user.id === id);
  if (index !== -1) return users.splice(index, 1)[0];
};

const getUser = id => users.find(user => user.id === id);

const getUsersInRoom = room => users.filter(user => user.room === room);

module.exports = { addUser, removeUser, getUser, getUsersInRoom };
