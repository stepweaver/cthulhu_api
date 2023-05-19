<<<<<<< Updated upstream
=======
const express = require('express'),
      morgan = require('morgan'),
      fs = require('fs'), // import built in node modules fs and path
      path = require('path'),
      bodyParser = require('body-parser'),
      uuid = require('uuid');

const app = express();
// create a write stream (in append mode)
// a 'log.txt' file is created in root directory
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})

// Middleware
app.use(morgan('combined', {stream: accessLogStream})); // The 'combined' parameter specifies that requests should be logged using Morgan's "combined" format.
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(morgan('combined'));

let users = [
  {
    id: 1,
    Username: 'davidrmcintyre',
    favoriteMovies: []
  },
  {
    id: 2,
    Username: 'smgruber',
    favoriteMovies: []
  },
  {
    id: 3,
    Username: 'deleteme',
    favoriteMovies: ['Locke']
  }
];

let movies = [
  {
    "Title": "Kings of the Road",
    "Description": "The film is about a projection-equipment repair mechanic named Bruno Winter (Rüdiger Vogler), who meets the depressed Robert Lander (Hanns Zischler), who has just been through a break-up with his wife, after he drives his car into a river in a half-hearted suicide attempt.",
    "Director": {
      "Name": "Wim Wenders",
      "Bio": "Wim Wenders is a German filmmaker, playwright, author, and photographer",
      "dateOfBirth": 1945
    },
    "Year": 1976,
    "Genre": {
      "Name": "Road-Movie",
      "Description": "A road movie is a film genre in which the main characters leave home on a road trip, typically altering the perspective from their everyday lives."
    },
    "ImageURL": "https://www.themoviedb.org/t/p/w1280/x2WvLtMJZ6OPz3GEhbEE1V29Pis.jpg",
    "Featured": true
  },
  {
    "Title": "Radio On",
    "Description": "In 1970s Britain, a man drives from London to Bristol to investigate his brothers death, and the purpose of his trip is offset by his encounters with a series of odd people.",
    "Director": {
      "firstName": "Chris",
      "lastName": "Petit",
      "Bio": "Chris Petit is an English novelist and filmmaker. During the 1970's he was the film editor for Time Out and wrote for Melody Maker.",
      "dateOfBirth": 1949
    },
    "Year": 1979,
    "Genre": {
      "Name": "Drama",
      "Description": "Drama films are a genre that relies on the emotional and relational development of realistic characters. They often feature intense character development, and sometimes rely on tragedy to evoke an emotional response from the audience."
    },
    "ImageURL": "https://www.themoviedb.org/t/p/w1280/jaKTAV3wuHRklubTFVPNgPOGeIs.jpg",
    "Featured": false
  },
  {
    "Title": "Vagabond",
    "Description": "A young woman's body is found frozen in a ditch. Through flashbacks and interviews, we see the events that led to her inevitable death.",
    "Director": {
      "firstName": "Agnes",
      "lastName": "Varda",
      "Bio": "Agnes Varda was a Belgian-born French film director, screenwriter, photographer, and artist. Her pioneering work was central to the development of the widely influential French New Wave film movement of the 1950s and 1960s.",
      "dateOfBirth": 1928,
      "dateOfDeath": 2019
      },
      "Year": 1985,
      "Genre": {
        "Name": "Drama",
        "Description": "Drama films are a genre that relies on the emotional and relational development of realistic characters. They often feature intense character development, and sometimes rely on tragedy to evoke an emotional response from the audience."
      },
      "ImageURL": "https://www.themoviedb.org/t/p/w1280/2KFfwiPct1hwqi9dkKqoom0BenC.jpg",
      "Featured": false
  }
];

// CREATE
app.post('/users', (req, res) => {
  const newUser = req.body;

  if (newUser.Username) {
    newUser.id = uuid.v4();
    users.push(newUser);
    res.status(201).json(newUser);
  } else {
    res.status(400).send('users need names');
  }
});

app.post('/users/:id/:movieTitle', (req, res) => {
  const { id, movieTitle } = req.params;

  let user = users.find( user => user.id == id ); // user.id will be a number and id will be a string. Using "==" is truthy.

  if (user) {
    user.favoriteMovies.push(movieTitle);
    res.status(200).send(`${movieTitle} added to ${user.Username}'s favorites`);
  } else {
    res.status(400).send('No such user');
  }
});

// READ
app.get('/', (req, res) => {
  res.send('Welcome to CthulhuFlix!');
});

app.get('/documentation', (req, res) => {
  res.send('This is a secret url with super top-secret content.');
});

app.get('/users', (req, res) => {
  res.json(users);
});

app.get('/users/:Username', (req, res) => {
  res.json(users.find((user) =>
  { return user.Username === req.params.Username }));
});

app.get('/movies', (req, res) => {
  res.status(200).json(movies);
});

app.get('/movies/:Title', (req, res) => {
  const { title } = req.params;
  const movie = movies.find( movie => movie.Title === title );

  if (movie) {
    res.status(200).json(movie);
  } else {
    res.status(400).send('No such movie');
  }
});

app.get('/movies/genres/:genreName', (req, res) => {
  const { genreName } = req.params;
  const genre = movies.find( movie => movie.Genre.Name === genreName ).Genre;

  if (genre) {
    res.status(200).json(genre);
  } else {
    res.status(400).send('No such genre');
  }
});

app.get('/movies/directors/:directorName', (req, res) => {
  const { directorName } = req.params;
  const director = movies.find( movie => movie.Director.Name === directorName ).Director;

  if (director) {
    res.status(200).json(director);
  } else {
    res.status(400).send('No such director');
  }
});

// UPDATE
app.put('/users/:id', (req, res) => {
  const { id } = req.params;
  const updatedUser = req.body;

  let user = users.find( user => user.id == id ); // user.id will be a number and id will be a string. Using "==" is truthy.

  if (user) {
    user.Username = updatedUser.Username;
    res.status(200).json(user);
  } else {
    res.status(400).send('No such user');
  }
});

// DELETE
app.delete('/users/:id/:movieTitle', (req, res) => {
  const { id, movieTitle } = req.params;

  let user = users.find( user => user.id == id ); // user.id will be a number and id will be a string. Using "==" is truthy.

  if (user) {
    user.favoriteMovies = user.favoriteMovies.filter( title => title !== movieTitle );
    res.status(200).send(`${movieTitle} removed from ${user.Username}'s favorites`);
  } else {
    res.status(400).send('No such user');
  }
});

app.delete('/users/:id', (req, res) => {
  const { id } = req.params;

  let user = users.find( user => user.id == id ); // user.id will be a number and id will be a string. Using "==" is truthy.

  if (user) {
    users = users.filter( user => user.id != id);
    res.status(200).send(`${user.Username} has been deleted`);
  } else {
    res.status(400).send('No such user');
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(8080, () => {
  console.log('App listening on port 8080');
});
>>>>>>> Stashed changes
