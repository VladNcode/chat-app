const socket = io();
const btn = document.getElementById('btn');
let num;

socket.on('countUpdated', function (count) {
  console.log('The count has been updated: ' + count);
});

btn.addEventListener('click', function () {
  socket.emit('increment');
});
