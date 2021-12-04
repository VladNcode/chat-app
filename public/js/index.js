const socket = io();
const form = document.querySelector('.form');
const input = document.getElementById('input');
const messageList = document.querySelector('.message');
const welcomeMsg = document.querySelector('#welcome');

const user = prompt('Tell us your username');
let msg;

if (user) socket.emit('user have chosen a nickname', user);

socket.on('welcome joined user from the server', () => {
  welcomeMsg.textContent = `Welcome ${user}`;
});

socket.on('you have entered the room', () => {
  console.log('You have entered the room');
});

socket.on('server share user connected', nickName => {
  if (nickName) console.log(`${nickName} entered the room`);
});

socket.on('server share message', msg => {
  li = document.createElement('li');
  li.innerHTML = msg;
  messageList.appendChild(li);
});

socket.on('server share user disconnected', user => {
  if (user) console.log(`${user} left the room`);
});

form.addEventListener('submit', e => {
  e.preventDefault();

  if (input.value.length > 0) {
    msg = user + ': ' + input.value;
    input.value = '';
    socket.emit('client message recieved', msg);
  }
});
