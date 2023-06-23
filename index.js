const express = require('express'),
  morgan = require('morgan'),
  fs = require('fs'),
  path = require('path'),
  bodyParser = require('body-parser'),
  uuid = require('uuid'),
  mongoose = require('mongoose'),
  Models = require('./models');

const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect('mongodb://127.0.0.1:27017/cthulhuFlixDB', { useNewUrlParser: true, useUnifiedTopology: true });

const app = express();

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})

// Middleware
app.use(morgan('combined')); // The 'combined' parameter specifies that requests should be logged using Morgan's "common" format.
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let auth = require('./auth')(app);

const passport = require('passport');
require('./passport');

// CREATE
app.post('/users', (req, res) => {
  Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + ' already exists');
      } else {
        Users.create({
          Username: req.body.Username,
          Password: req.body.Password,
          Email: req.body.Email,
          Birthday: req.body.Birthday
        })
          .then((user) => {
            res.status(201).json(user);
          })
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

app.post('/users/:Username/movies/:MovieId', async (req, res) => {
  try {
    const user = await Users.findOne({ Username: req.params.Username }).exec();

    if (!user) {
      return res.status(404).send('User not found');
    }

    const movieId = req.params.MovieId;
    const isMovieInFavorites = user.FavoriteMovies.includes(movieId);

    if (isMovieInFavorites) {
      return res.status(409).send('Movie already in favorites');
    }

    user.FavoriteMovies.push(movieId);
    const updatedUser = await user.save();

    const movie = await Movies.findById(req.params.MovieId).exec();

    res.status(200).send(`${movie.Title} was added to ${req.params.Username}'s favorites`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error: ' + err);
  }
});

// READ
app.get('/', (req, res) => {
  res.send('Welcome to CthulhuFlix!');
});

app.get('/documentation', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'documentation.html'));;
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

app.get('/users', (req, res) => {
  Users.find()
    .then((users) => {
      res.status(200).json(users);
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

app.get('/movies/:title', (req, res) => {
  Movies.findOne({ Title: req.params.title })
  .then((movie) => {
    res.json(movie);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

app.get('/movies/genres/:genreName', (req, res) => {
  Movies.findOne({ 'Genre.Name': req.params.genreName })
    .then((genre) => {
      if (!genre) {
        res.status(404).send('Genre not found');
      } else {
        res.status(200).json(genre.Genre);
      }
    });
});

app.get('/movies/directors/:directorName', (req, res) => {
  Movies.findOne({ 'Director.Name': req.params.directorName })
    .then((director) => {
      if (!director) {
        res.status(404).send('Director not found');
      } else {
        res.status(200).json(director.Director);
      }
    });
});

// UPDATE
app.put('/users/:Username', (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, { $set:
    {
      Username: req.body.Username,
      Password: req.body.Password,
      Email: req.body.Email,
      Birthday: req.body.Birthday
    }
  },
  { new: true })
    .then((updatedUser) => {
      res.status(200).json(updatedUser);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// DELETE
app.delete('/users/:Username/movies/:MovieId', (req, res) => {
  Users.findOne({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
        res.status(404).send('User not found');
      } else {
        const movieId = req.params.MovieId;
        const movieIndex = user.FavoriteMovies.indexOf(movieId);

        if (movieIndex === -1) {
          res.status(404).send(`Movie not found in ${user.Username}'s favorites`);
        } else {
          user.FavoriteMovies.splice(movieIndex, 1);

          user.save()
            .then(() => {
              return Movies.findById(movieId);
            })
            .then((movie) => {
              if (!movie) {
                res.status(404).send('Movie not found');
              } else {
                res.status(200).send(`${movie.Title} was removed from ${user.Username}'s favorites`);
              }
            })
            .catch((err) => {
              console.error(err);
              res.status(500).send('Error: ' + err);
            });
        }
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

app.delete('/users/:Username', (req, res) => {
  Users.findOneAndRemove({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
        res.status(400).send(`${req.params.Username} was not found`);
      } else {
        res.status(200).send(`${req.params.Username}'s account was deleted`);
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

app.listen(8080, () => console.log('Listening on 8080'));