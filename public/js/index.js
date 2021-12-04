const socket = io();
const messageForm = document.querySelector('.message-form');
const messageFormInput = document.getElementById('message-input');
const messageFormButton = document.getElementById('message-btn');
const messageList = document.querySelector('.message');
const welcomeMsg = document.querySelector('#welcome');
const geoBtn = document.querySelector('#send-location');

const user = prompt('Tell us your username');
if (user) socket.emit('user have chosen a nickname', user);

socket.on('welcome joined user from the server', () => {
  welcomeMsg.textContent = `Welcome ${user}`;
});

socket.on('message', data => {
  if (data === 'entered the room') return;
  if (data === 'undefined left the room 👋') return;
  console.log(data);
});

socket.on('server share message', msg => {
  li = document.createElement('li');
  li.innerHTML = msg;
  messageList.appendChild(li);
});

messageForm.addEventListener('submit', e => {
  e.preventDefault();

  // disable button
  messageFormButton.setAttribute('disabled', 'disabled');

  if (messageFormInput.value.length > 0) {
    let msg = user + ': ' + messageFormInput.value;
    messageFormInput.value = '';
    socket.emit('client message recieved', msg, message => {
      console.log('The message was delivered to the server!', message);

      // enable button
      messageFormButton.removeAttribute('disabled');
    });
  }
});

geoBtn.addEventListener('click', function () {
  if (!navigator.geolocation) return alert('Geolocation not available');

  geoBtn.setAttribute('disabled', 'disabled');

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

    socket.emit('client location recieved', data, message => {
      console.log('User shared location!', message);
      geoBtn.removeAttribute('disabled');
    });
  };

  const error = function (err) {
    console.log(`ERROR(${err.code}): ${err.message}`);
  };

  navigator.geolocation.getCurrentPosition(success, error, options);
});
