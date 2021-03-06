const socket = io();

const welcomeMsg = document.querySelector('#welcome');
const welcomeRoom = document.querySelector('#roomid');
const messageForm = document.querySelector('.message-form');
const messageFormInput = document.getElementById('message-input');
const messageFormButton = document.getElementById('message-btn');
const messageList = document.querySelector('.message');
const geoButton = document.querySelector('#send-location');
const messages = document.querySelector('#messages');
const usersList = document.querySelector('.users');
const roomname = document.querySelector('.room-title');

//* Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;
const usersTemplate = document.querySelector('#users-template').innerHTML;

//* Options
let { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

const autoscroll = () => {
  // Last message element
  const lastMessage = messages.lastElementChild;

  // Height of the last message
  const lastMessageStyles = getComputedStyle(lastMessage);
  const lastMessageMargin = parseInt(lastMessageStyles.marginBottom);
  const lastMessageHeight = lastMessage.offsetHeight + lastMessageMargin;

  // Visible height
  const visibleHeight = messages.offsetHeight;

  // Height of messages container
  const containerHeight = messages.scrollHeight;

  // How far have i scrolled?
  const scrollOffset = messages.scrollTop + visibleHeight;

  if (containerHeight - lastMessageHeight <= scrollOffset) {
    messages.scrollTop = messages.scrollHeight;
  }
};

if (username === '' || room === '') {
  alert('You must choose a username and a room');
  location.href = '/';
}

if (username && room)
  socket.emit('join', { username, room }, error => {
    if (error) {
      alert(error);
      location.href = '/';
    }
  });

socket.on('welcome joined user from the server', ({ username, text, createdAt }) => {
  const html = Mustache.render(messageTemplate, {
    user: 'Server',
    message: text,
    createdAt: moment(createdAt).format('HH:mm:ss'),
  });
  messages.insertAdjacentHTML('beforeend', html);
  // messages.scrollTo({ top: messages.scrollHeight, behavior: 'smooth' });
  autoscroll();

  roomname.textContent = `Room: "${room}"`;
});

socket.on('roomData', data => {
  usersList.innerHTML = '';
  data.users.forEach(user => {
    const html = Mustache.render(usersTemplate, {
      user: user.username,
    });
    usersList.insertAdjacentHTML('beforeend', html);
  });
});

socket.on('message', data => {
  if (data.text === 'undefined left the room ????') return;

  const html = Mustache.render(messageTemplate, {
    user: data.username,
    message: data.text,
    createdAt: moment(data.createdAt).format('HH:mm:ss'),
  });
  messages.insertAdjacentHTML('beforeend', html);
  // messages.scrollTo({ top: messages.scrollHeight, behavior: 'smooth' });
  autoscroll();
});

socket.on('server share location', data => {
  const html = Mustache.render(locationTemplate, {
    user: data.user,
    location: data.loc,
    message: `Shared location`,
    createdAt: moment(data.createdAt).format('HH:mm:ss'),
  });
  messages.insertAdjacentHTML('beforeend', html);
  messages.scrollTo({ top: messages.scrollHeight, behavior: 'smooth' });
});

messageForm.addEventListener('submit', e => {
  e.preventDefault();

  if (messageFormInput.value.length > 0) {
    let msg = messageFormInput.value;
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
      username,
      room,
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
