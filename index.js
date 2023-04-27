const express = require('express');
  morgan = require('morgan');

const app = express();

// Middleware
app.use(morgan('common')); // The 'common' parameter specifies that requests should be logged using Morgan's "common" format.

app.get('/', (req, res) => {
  res.send('Welcome to CthulhuFlix!');
});

app.get('/secreturl', (req, res) => {
  res.send('This is a secret url with super top-secret content.');
});

app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});

