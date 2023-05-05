const express = require('express'),
  app = express(),
  mongoose = require('mongoose'),
  Models = require('./models.js'),
  morgan = require('morgan'),
  fs = require('fs'), // import built in node modules fs and path
  path = require('path');
  bodyParser = require('body-parser');
  uuid = require('uuid');
  
const Movies = Models.Movie;
const Users = Models.User;

mongoose.set('debug', true);

mongoose.connect('mongodb://127.0.0.1:27017/cthulhuFlixDB', { useNewUrlParser: true, useUnifiedTopology: true });

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})

let auth = require('./auth.js')(app);

const passport = require('passport');
require('./passport.js');

// Middleware
app.use(morgan('combined', {stream: accessLogStream})); // The 'combined' parameter specifies that requests should be logged using Morgan's "combined" format.
app.use(express.static('public'));
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// CREATE
app.post('/users', (req, res) => {
  Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + 'already exists');
      } else {
        Users
          .create({
            Username: req.body.Username,
            Password: req.body.Password,
            Email: req.body.Email,
            Birthday: req.body.Birthday
          })
          .then((user) => {res.status(201).json(user) })
        .catch((error) => {
          console.error(error);
          res.status(500).send('Error: ' + error);
        })
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

app.post('/users/:Username/movies/:MovieId', (req, res) => {
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

// READ
app.get('/', (req, res) => {
  res.send('Welcome to CthulhuFlix!');
});

app.get('/documentation.html', (req, res) => {
  res.sendFile('documentation.html', { root: 'public' });
});

app.get('/movies', (req, res) => {
  Movies.find()
    .then((movies) => {
      res.status(200).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

app.get('/movies/:Title', (req, res) => {
  Movies.findOne( { Title: req.params.Title })
    .then((movie) => {
      res.json(movie);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

app.get('/movies/genres/:Name', (req, res) => {
  Movies.findOne({ 'Genre.Name': req.params.Name })
    .then((genre) => {
      if (!genre) {
        res.status(404).send('Genre not found.');
      } else {
        res.status(200).json(genre.Genre);
      }
    });
});

app.get('/movies/directors/:Name', (req, res) => {
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

app.get('/users/:Username', (req, res) => {
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
app.put('/users/:Username', (req, res) => {
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

// DELETE
app.delete('/users/:Username', (req, res) => {
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

app.delete('/users/:Username/movies/:MovieId', (req, res) => {
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

app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});