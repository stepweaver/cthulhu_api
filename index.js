const express = require('express'),
  morgan = require('morgan'),
  fs = require('fs'), // import built in node modules fs and path
  path = require('path');
  bodyParser = require('body-parser');
  uuid = require('uuid');

const app = express();
// create a write stream (in append mode)
// a 'log.txt' file is created in root directory
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})

// Middleware
app.use(morgan('combined', {stream: accessLogStream})); // The 'combined' parameter specifies that requests should be logged using Morgan's "combined" format.
app.use(express.static('public'));
app.use(morgan('combined'));
app.use(bodyParser.json());

let users = [
  {
    id: 1,
    name: 'davidrmcintyre',
    favoriteMovies: []
  },
  {
    id: 2,
    name: 'smgruber',
    favoriteMovies: []
  },
  {
    id: 3,
    name: 'deleteme',
    favoriteMovies: ['Locke']
  }
];

let movies = [
  {
    "Title": "Kings of the Road",
    "Description": "The film is about a projection-equipment repair mechanic named Bruno Winter (Rüdiger Vogler), who meets the depressed Robert Lander (Hanns Zischler), who has just been through a break-up with his wife, after he drives his car into a river in a half-hearted suicide attempt.",
    "Genre": {
      "Name": "Road-Movie",
      "Description": "A road movie is a film genre in which the main characters leave home on a road trip, typically altering the perspective from their everyday lives."
    },
    "Director": {
      "Name": "Wim Wenders",
      "Bio": "Wim Wenders is a German filmmaker, playwright, author, and photographer",
      "dateOfBirth": 1945
    },
    "Year": 1976,
    "ImageURL": "https://www.themoviedb.org/t/p/w1280/x2WvLtMJZ6OPz3GEhbEE1V29Pis.jpg",
    "Featured": true
  },
  {
    "Title": "Radio On",
    "Description": "In 1970s Britain, a man drives from London to Bristol to investigate his brothers death, and the purpose of his trip is offset by his encounters with a series of odd people.",
    "Genre":{
      "Name": "Drama",
      "Description": "Drama films are a genre that relies on the emotional and relational development of realistic characters. They often feature intense character development, and sometimes rely on tragedy to evoke an emotional response from the audience."
    },
    "Director": {
      "Name": "Chris Petit",
      "Bio": "Chris Petit is an English novelist and filmmaker. During the 1970's he was the film editor for Time Out and wrote for Melody Maker.",
      "dateOfBirth": 1949
    },
    "Year": 1979,
    "ImageURL": "https://www.themoviedb.org/t/p/w1280/jaKTAV3wuHRklubTFVPNgPOGeIs.jpg",
    "Featured": false
  },
  {
    "Title": "Vagabond",
    "Description": "A young woman's body is found frozen in a ditch. Through flashbacks and interviews, we see the events that led to her inevitable death.",
    "Genre": {
      "Name": "Drama",
      "Description": "Drama films are a genre that relies on the emotional and relational development of realistic characters. They often feature intense character development, and sometimes rely on tragedy to evoke an emotional response from the audience."
    },
    "Director": {
      "Name": "Agnes Varda",
      "Bio": "Agnes Varda was a Belgian-born French film director, screenwriter, photographer, and artist. Her pioneering work was central to the development of the widely influential French New Wave film movement of the 1950s and 1960s.",
      "dateOfBirth": 1928,
      "dateOfDeath": 2019
      },
      "Year": 1985,
      "ImageURL": "https://www.themoviedb.org/t/p/w1280/2KFfwiPct1hwqi9dkKqoom0BenC.jpg",
      "Featured": false
  },
  {
    "Title": "Leningrad Cowboys Go America",
    "Description": "Siberian rock band Leningrad Cowboys go to the USA in pursuit of fame.",
    "Genre": {
      "Name": "Comedy",
      "Description": "A comedy film is a category of film which emphasizes humor. These films are designed to make the audience laugh through the amusement."
    },
    "Director": {
      "Name": "Aki Kaurismäki",
      "Bio": "Aki Kaurismäki is a Finnish film director and screenwriter. He has been described as Finland's best known film director.",
      "dateOfBirth": 1957
    },
    "Year": 1989,
    "ImageURL": "https://www.themoviedb.org/t/p/w1280/6lJj3w5ebOkrsNx6sJXyNuWDJIB.jpg",
    "Featured": false
  },
];

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

// READ
app.get('/', (req, res) => {
  res.send('Welcome to CthulhuFlix!');
});

app.get('/documentation.html', (req, res) => {
  res.sendFile('documentation.html', { root: 'public' });
});

app.get('/movies', (req, res) => {
  res.status(200).json(movies);
});

app.get('/movies/:title', (req, res) => {
  const { title } = req.params;
  const movie = movies.find( movie => movie.Title === title );

  if (movie) {
    res.status(200).json(movie);
  } else {
    res.status(400).send('No such movie');
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});