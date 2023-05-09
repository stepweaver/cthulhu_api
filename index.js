const express = require('express'),
  app = express(),
  mongoose = require('mongoose'),
  Models = require('./models.js'),
  morgan = require('morgan'),
  fs = require('fs'), // import built in node modules fs and path
  path = require('path');
  bodyParser = require('body-parser');
  uuid = require('uuid');
  session = require('express-session');
  Movies = Models.Movie;
  Users = Models.User;
  accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'});
  cors = require('cors');


// Client-side validation
const { check, validationResult } = require('express-validator');

// CORS Policy
let allowedOrigins = ['*']
app.use(cors({
  origin: (origin, callback) => {
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){
      let message = 'The CORS policy for this application doesn\'t allow access from origin ' + origin;
      return callback(new Error(message ), false);
    }
    return callback(null, true);
  }
}));

// Import passport and the authentication modules
const passport = require('passport');
  auth = require('./auth.js')(app);
  require('./passport.js');

// Connect to the database
mongoose.set('debug', true);
mongoose.connect('mongodb+srv://weaverst:rGbSYhf636hdcVrz@cthulhuflix.0grural.mongodb.net/CthulhuFlixDB?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });

// Configure express-session middleware
app.use(session({
  secret: 'a secret key should not be shared',
  resave: false,
  saveUninitialized: false
}));

// Middleware
app.use(morgan('combined', {stream: accessLogStream})); // The 'combined' parameter specifies that requests should be logged using Morgan's "combined" format.
app.use(express.static('public'));
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());

// CREATE
app.post('/users',
  [
    check('Username', 'Username is required').isLength({min: 5}),
    check('Username', 'Username contains non alphanumeric characters - not allowed').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
  ], (req, res) => {

  let errors = validationResult(req);

  if (!errors.isEmpty()) { // if an error occurs, the rest of the code will not execute
    return res.status(422).json({ errors: errors.array() });
  }
  let hashedPassword = Users.hashPassword(req.body.Password);
  Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + 'already exists');
      } else {
        Users
          .create({
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            Birthday: req.body.Birthday
          })
          .then((user) => {res.status(201).json(user) })
          .catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' + error);
          });
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

// READ
app.get('/', (req, res) => {
  res.send('Welcome to CthulhuFlix!');
});

app.get('/documentation.html', (req, res) => {
  res.sendFile('documentation.html', { root: 'public' });
});

app.get('/movies', passport.authenticate('jwt', { sessions: false }), (req, res) => {
  Movies.find()
    .then((movies) => {
      res.status(200).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

app.get('/movies/:Title', passport.authenticate('jwt', { sessions: false }), (req, res) => {
  Movies.findOne( { Title: req.params.Title })
    .then((movie) => {
      res.json(movie);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

app.get('/movies/genres/:Name', passport.authenticate('jwt', { sessions: false }), (req, res) => {
  Movies.findOne({ 'Genre.Name': req.params.Name })
    .then((genre) => {
      if (!genre) {
        res.status(404).send('Genre not found.');
      } else {
        res.status(200).json(genre.Genre);
      }
    });
});

app.get('/movies/directors/:Name', passport.authenticate('jwt', { sessions: false }), (req, res) => {
  Movies.findOne({ 'Director.Name': req.params.Name })
    .then((director) => {
      if (!director) {
        res.status(404).send('Director not found');
      } else {
        res.status(200).json(director.Director);
      }
    });
});

app.get('/users', (req, res) => {
  Users.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

app.get('/users/:Username', passport.authenticate('jwt', { sessions: false }), (req, res) => {
  Users.findOne({ Username: req.params.Username })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// UPDATE
app.put('/users/:Username', passport.authenticate('jwt', { sessions: false }), 
  [
    check('Username', 'Username is required').isLength({mind: 5}),
    check('Username', 'Username contains non alphanumeric characters - not allowed').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
  ], (req, res) => {

  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  let hashedPassword = Users.hasPassword(req.body.Password);
  Users.findOneAndUpdate({ Username: req.params.Username }, {
    $set: {
      Username: req.body.Username,
      Password: req.body.Password,
      Email: req.body.Email
    }
  }, { new: true }) // Return the updated document
    .then(updatedUser => {
      res.json(updatedUser);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error ' + err);
    });
});

app.post('/users/:Username/movies/:MovieId', passport.authenticate('jwt', { sessions: false }), (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, {
    $addToSet: { FavoriteMovies: req.params.MovieId }
  },
  { new: true }
  ).exec()
    .then(updatedUser => {
      res.json(updatedUser);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

// DELETE
app.delete('/users/:Username', passport.authenticate('jwt', { sessions: false }), (req, res) => {
  Users.findOneAndRemove({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
        res.status(400).send('User not found');
      } else {
        res.status(200).send(req.params.Username + ' DELETED!');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

app.delete('/users/:Username/movies/:MovieId', passport.authenticate('jwt', { sessions: false }), (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, {
    $pull: { FavoriteMovies: req.params.MovieId }
  },
  { new: true }
  ).exec()
    .then(updatedUser => {
      res.status(200).send('Removed from Favorites');
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke! Error: ' + err);
});

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log('Listening on Port ' + port);
});