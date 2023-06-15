const express = require('express'),
      app = express(),
      bodyParser = require('body-parser'),
      uuid = require('uuid'),
      morgan = require('morgan'),
      fs = require('fs'), // import built in node modules fs and path
      path = require('path');

// create a write stream (in append mode)
// a 'log.txt' file is created in root directory
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})

// Middleware
app.use(morgan('combined', {stream: accessLogStream})); // The 'combined' parameter specifies that requests should be logged using Morgan's "combined" format.
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(morgan('combined'));
app.use(bodyParser.urlencoded({ extended: true }));

let users = [
  {
    id: 1,
    "Username":"danielOcean",
    "Email":"georgeClooney@lasvegas.com",
    "Birthday": "1844-01-01",
    "FavoriteMovies": []
  },
  {
    id: 2,
    "Username":"tylerDurden",
    "Email":"fightclub@gmail.com",
    "Birthday": "1844-01-01",
    "FavoriteMovies": []
  },
  {
    id: 3,
    "Username":"uncleRoger",
    "Email":"fuyo@gmail.com",
    "Birthday": "1844-01-01",
    "FavoriteMovies": []
  }
];

let movies = [
  {
    "Title": "Ocean\'s Eleven",
    "Description": "Danny Ocean and his ten accomplices plan to rob three Las Vegas casinos simultaneously.",
    "Director": {
      "Name": "Steven Soderbergh",
      "Bio": "Steven Andrew Soderbergh was born on January 14, 1963 in Atlanta, Georgia, USA, the second of six children of Mary Ann (Bernard) and Peter Soderbergh. His father was of Swedish and Irish descent, and his mother was of Italian ancestry. While he was still at a very young age, his family moved to Baton Rouge, Louisiana, where his father was a professor and the dean of the College of Education at Louisiana State University. While still in high school, around the age of 15, Soderbergh enrolled in the university\'s film animation class and began making short 16-millimeter films with second-hand equipment, one of which was the short film \"Janitor\". After graduating high school, he went to Hollywood, where he worked as a freelance editor. His time there was brief and, shortly after, he returned home and continued making short films and writing scripts.",
      "yearOfBirth":"1963"
    },
    "Actors": [ "George Clooney", "Brad Pitt", "Julia Roberts" ],
    "releaseYear": "2001",
    "Genre": {
      "Name": "Crime",
      "Description": "Crime is a film genre inspired by and analogous to the crime fiction literary genre. Films of this genre generally involve various aspects of crime and its detection. Stylistically, the genre may overlap and combine with many other genres, such as drama or gangster film, but also include comedy, and, in turn, is divided into many sub-genres, such as mystery, suspense or noir."
    },
    "imageURL": "https://m.media-amazon.com/images/M/MV5BYzVmYzVkMmUtOGRhMi00MTNmLThlMmUtZTljYjlkMjNkMjJkXkEyXkFqcGdeQXVyNDk3NzU2MTQ@._V1_.jpg",
    "Rating":"PG-13",
    "Featured": false
  },
  {
    "Title": "John Wick",
    "Description": "An ex-hit-man comes out of retirement to track down the gangsters that killed his dog and took his car.",
    "Genre": {
      "Name": "Action",
      "Description": "Action film is a genre in which the protagonist is thrust into a series of events that typically involve violence and physical feats."
    },
    "Director": {
      "Name": "Chad Stahelski",
      "Bio": "He came from a kick-boxing background; he entered the film field as a stunt performer at the age of 24. Before that, he worked as an instructor at the Inosanto Martial Arts Academy in California, teaching Jeet Kune Do/Jun Fan. After doing numerous roles in low budget martial art movies like Mission of Justice (1992) and Bloodsport III (1996) his first start as a stunt double came from the movie The Crow (1994) for doubling late Brandon Lee whom he trained with at the Inosanto Academy. After Brandon Lee\'s lethal accident Chad was picked for his stunt/photo double because he knew Lee, how he moved, and looked more like him than any other stuntman.",
      "yearOfBirth":"1968"
    },
    "Actors": [ "Keanu Reeves", "Michael Nyqvist", "Alfie Allen" ],
    "imageURL": "https://m.media-amazon.com/images/M/MV5BMTU2NjA1ODgzMF5BMl5BanBnXkFtZTgwMTM2MTI4MjE@._V1_.jpg",
    "Rating": "R",
    "releaseYear": "2014",
    "Featured": false
  },
  {
    "Title": "Fight Club",
    "Description": "An insomniac office worker and a devil-may-care soap maker form an underground fight club that evolves into much more.",
    "releaseYear": "1999",
    "Genre": {
      "Name": "Drama",
      "Description": "In film and television, drama is a category or genre of narrative fiction (or semi-fiction) intended to be more serious than humorous in tone. A primary element in a drama is the occurrence of conflict—emotional, social, or otherwise—and its resolution in the course of the storyline."
    },
    "Director": {
      "Name": "David Fincher",
      "Bio": "David Fincher was born in 1962 in Denver, Colorado, and was raised in Marin County, California. When he was 18 years old he went to work for John Korty at Korty Films in Mill Valley. He subsequently worked at ILM (Industrial Light and Magic) from 1981-1983. Fincher left ILM to direct TV commercials and music videos after signing with N. Lee Lacy in Hollywood. He went on to found Propaganda in 1987 with fellow directors Dominic Sena, Greg Gold and Nigel Dick. Fincher has directed TV commercials for clients that include Nike, Coca-Cola, Budweiser, Heineken, Pepsi, Levi\'s, Converse, AT&T and Chanel. He has directed music videos for Madonna, Sting, The Rolling Stones, Michael Jackson, Aerosmith, George Michael, Iggy Pop, The Wallflowers, Billy Idol, Steve Winwood, The Motels and, most recently, A Perfect Circle.","yearOfBirth":"1962"
    },
    "Actors": [ "Brad Pitt", "Edward Norton", "Meat Loaf" ],
    "imageURL": "https://m.media-amazon.com/images/M/MV5BNDIzNDU0YzEtYzE5Ni00ZjlkLTk5ZjgtNjM3NWE4YzA3Nzk3XkEyXkFqcGdeQXVyMjUzOTY1NTc@._V1_.jpg",
    "Rating": "R",
    "Featured": false
  }
];

// CREATE
app.post('/users', (req, res) => {
  const newUser = req.body;

  if(newUser.Username) {
    newUser.id = uuid.v4();
    newUser.FavoriteMovies = [];
    users.push(newUser);
    res.status(201).json(newUser);
  } else {
    res.status(400).send('Users need names');
  }
});

app.post('/users/:id/:movieTitle', (req, res) => {
  const { id, movieTitle } = req.params;

  let user = users.find( user => user.id == id );

  if (user) {
    user.FavoriteMovies.push(movieTitle);
    res.status(200).send(`${movieTitle} has been added to ${user.Username}'s favorites.`);
  } else {
    res.status(400).send('No such user');
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
  res.status(200).json(movies);
});

app.get('/users/:username', (req, res) => {
  const { username } = req.params;
  const user = users.find(user => user.Username === username);

  if (user) {
    res.status(200).json(user);
  } else {
    res.status(404).send('User not found');
  }
});

app.get('/movies/:title', (req, res) => {
  const { title } = req.params;
  const movie = movies.find( movie => movie.Title === title);

  if (movie) {
    res.status(200).json(movie);
  } else {
    res.status(400).send('No such movie');
  }
});

app.get('/movies/genres/:genreName', (req, res) => {
  const { genreName } = req.params;
  const genre = movies.find( movie => movie.Genre.Name === genreName )?.Genre;

  if (genre) {
    res.status(200).json(genre);
  } else {
    res.status(400).send('No such genre');
  }
});

app.get('/movies/directors/:directorName', (req, res) => {
  const { directorName } = req.params;
  const director = movies.find( movie => movie.Director.Name === directorName )?.Director;

  if (director) {
    res.status(200).json(director);
  } else {
    res.status(400).send('No such director');
  }
});

app.get('/users', (req, res) => {
  res.status(200).json(users);
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

  let user = users.find( user => user.id == id );

  if (user) {
    user.FavoriteMovies = user.FavoriteMovies.filter( title => title !== movieTitle );
    res.status(200).send(`${movieTitle} has been removed from ${user.Username}'s favorites.`);
  } else {
    res.status(400).send('No such user');
  }
});

app.delete('/users/:id', (req, res) => {
  const { id } = req.params;

  let user = users.find( user => user.id == id );

  if (user) {
    users = users.filter( user => user.id != id);
    res.status(200).send(`${user.Username}'s account has been deleted`);
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