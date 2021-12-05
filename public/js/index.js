const socket = io();

const welcomeMsg = document.querySelector('#welcome');
const messageForm = document.querySelector('.message-form');
const messageFormInput = document.getElementById('message-input');
const messageFormButton = document.getElementById('message-btn');
const messageList = document.querySelector('.message');
const geoButton = document.querySelector('#send-location');
const messages = document.querySelector('.messages');

//* Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;

const user = prompt('Tell us your username');
if (user) socket.emit('user have chosen a nickname', user);

socket.on('welcome joined user from the server', () => {
  welcomeMsg.textContent = `Welcome ${user}`;
});

socket.on('message', data => {
  if (data.text === 'entered the room') return;
  if (data.text === 'undefined left the room 👋') return;

  const html = Mustache.render(messageTemplate, {
    message: data.text,
    createdAt: moment(data.createdAt).format('HH:mm:ss'),
  });
  messages.insertAdjacentHTML('afterbegin', html);
});

socket.on('server share location', data => {
  const html = Mustache.render(locationTemplate, {
    location: data.loc,
    message: `✉️ ${data.user} shared his location`,
    createdAt: moment(data.createdAt).format('HH:mm:ss'),
  });
  messages.insertAdjacentHTML('afterbegin', html);
});

messageForm.addEventListener('submit', e => {
  e.preventDefault();

  if (messageFormInput.value.length > 0) {
    let msg = user + '🗯️: ' + messageFormInput.value;
    messageFormInput.value = '';
    messageFormInput.focus();
    messageFormButton.setAttribute('disabled', 'disabled');

    socket.emit('client message recieved', msg, message => {
      console.log('The message was delivered to the server!', message);

      // enable button
      messageFormButton.removeAttribute('disabled');
    });
  }
});

geoButton.addEventListener('click', function () {
  if (!navigator.geolocation) return alert('Geolocation not available');

  geoButton.setAttribute('disabled', 'disabled');

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
      geoButton.removeAttribute('disabled');
    });
  };

  const error = function (err) {
    console.log(`ERROR(${err.code}): ${err.message}`);
  };

  navigator.geolocation.getCurrentPosition(success, error, options);
});
