const express = require('express');
const path = require('path');

const app = express();
console.log(__dirname);
app.use(express.static(path.join(__dirname, '../public')));

// app.get('/', (req, res) => {
//   res.status(200).send('Chat app');
// });

module.exports = app;
