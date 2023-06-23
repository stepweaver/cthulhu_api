const passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy,
  Models = require('./models'),
  passportJWT = require('passport-jwt');

let Users = Models.User,
  JWTStrategy = passportJWT.Strategy,
  ExtractJWT = passportJWT.ExtractJwt;

passport.use(new LocalStrategy({
  usernameField: 'Username',
  passwordField: 'Password'
}, (username, password) => {
  console.log(username + ' ' + password);
    
  return new Promise((resolve, reject) => {
    Users.findOne({ Username: username })
      .then((user) => {
        if (!user) {
          console.log('incorrect username');
          reject({ message: 'Incorrect username or password' });
        }
          
        console.log('finished');
        resolve(user);
      })
      .catch((error) => {
        console.log(error);
        reject(error);
      });
  });
}));
  
passport.use(new JWTStrategy({
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
  secretOrKey: 'your_jwt_secret'
}, (jwtPayload) => {
  return new Promise((resolve, reject) => {
    Users.findById(jwtPayload._id)
      .then((user) => {
        resolve(user);
      })
      .catch((error) => {
        reject(error);
      });
  });
}));