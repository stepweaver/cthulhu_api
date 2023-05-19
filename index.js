const express = require('express'),
      mongoose = require('mongoose'),
      Models = require('./models');
      morgan = require('morgan'),
      fs = require('fs'), // import built in node modules fs and path
      path = require('path'),
      bodyParser = require('body-parser'),
      uuid = require('uuid'),
      Movies = Models.Movie,
      Users = Models.User;

mongoose.connect('mongodb://localhost:27017/cthulhuFlixDB', { userNewUrlParser: true, useUnifiedTopology: true });

const app = express();
// create a write stream (in append mode)
// a 'log.txt' file is created in root directory
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})

// Middleware
app.use(morgan('combined', {stream: accessLogStream})); // The 'combined' parameter specifies that requests should be logged using Morgan's "combined" format.
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(morgan('combined'));
app.use(bodyParser.urlencoded({ extended: true }));

// CREATE
app.post('/users', (req, res) => {
  const newUser = req.body;

  if(newUser.name) {
    newUser.id = uuid.v4();
    users.push(newUser);
    res.status(201).json(newUser);
  } else {
    res.status(400).send('users need names');
  }
});

app.post('/users/:id/:movieTitle', (req, res) => {
  const { id, movieTitle } = req.params;

  let user = users.find( user => user.id == id );

  if (user) {
    user.favoriteMovies.push(movieTitle);
    res.status(200).send(`${movieTitle} has been added to ${user.name}'s favorites`);
  } else {
    res.status(400).send('No such user');
  }
});

app.get('/', (req, res) => {
  res.send('Welcome to CthulhuFlix!');
});

app.get('/documentation', (req, res) => {
  res.send('This is a secret url with super top-secret content.');
});

app.get('/movies', (req, res) => {
  res.status(200).json(movies);
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(8080, () => {
  console.log('App listening on port 8080');
});