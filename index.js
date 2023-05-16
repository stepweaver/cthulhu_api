const express = require('express');
const morgan = require('morgan');
const fs = require('fs'); // import built in node modules fs and path
const path = require('path');

const app = express();
// create a write stream (in append mode)
// a 'log.txt' file is created in root directory
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})

// Middleware
app.use(morgan('dev', {stream: accessLogStream})); // The 'dev' parameter specifies that requests should be logged using Morgan's "dev" format.

app.get('/', (req, res) => {
  res.send('Welcome to CthulhuFlix!');
});

app.get('/documentation', (req, res) => {
  res.send('This is a secret url with super top-secret content.');
});

app.listen(8080, () => {
  console.log('App listening on port 8080');
});