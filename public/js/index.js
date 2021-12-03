const socket = io();
const form = document.querySelector('.form');
const input = document.getElementById('input');
const messageList = document.querySelector('.message');
const welcomeMsg = document.querySelector('#welcome');

const user = prompt('Tell us your username');
let msg;

socket.on('welcome joined user from the server', () => {
  welcomeMsg.textContent = `Welcome ${user}`;
});

socket.on('server share message', msg => {
  li = document.createElement('li');
  li.innerHTML = msg;
  messageList.appendChild(li);
});

form.addEventListener('submit', e => {
  e.preventDefault();

  if (input.value.length > 0) {
    msg = user + ': ' + input.value;
    input.value = '';
    socket.emit('client message recieved', msg);
  }
});
