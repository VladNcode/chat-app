const socket = io();
const form = document.querySelector('.form');
const input = document.getElementById('input');
const messageList = document.querySelector('.message');
const welcomeMsg = document.querySelector('#welcome');
const geoBtn = document.querySelector('#send-location');

geoBtn.addEventListener('click', function () {
  if (!navigator.geolocation) return alert('Geolocation not available');

  const options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0,
  };

  const success = function (pos) {
    const crd = pos.coords;
    const data = {
      lat: crd.latitude,
      lng: crd.longitude,
    };

    socket.emit('client location recieved', data);
  };

  const error = function (err) {
    console.log(`ERROR(${err.code}): ${err.message}`);
  };

  navigator.geolocation.getCurrentPosition(success, error, options);
});

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

socket.on('server share location', data => {
  console.log(
    `${data.user} shared his position: lat ${data.data.lat}, lon ${data.data.lng}`
  );
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
