const jwtSecret = 'your_jwt_secret'; // This has to be the same key used in the JWTStrategy

const jwt = require('jsonwebtoken');
const passport = require('passport');
const require('./passport.js');

let generateJWTToken = (user) => {
  return new Promise((resolve, reject) => {
    jwt.sign(user, jwtSecret, {
      subject: user.Username, // This is the username you're encoding in the JWT
      expiresIn: '7d', // This specifies that the token will expire in 7 days
      algorithm: 'HS256' // This is the algorithm used to "sign" or encode the values of the JWT
    }, (error, token) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });
  });
}

/* POST login */
module.exports = (router) => {
  router.post('/login', (req, res) => {
    passport.authenticate('local', { session: false }, (error, user, info) => {
      if (error || !user) {
        return res.status(400).json({
          message: 'Something is not right',
          user: user
        });
      }
      req.login(user, { session: false }, (error) => {
        if (error) {
          res.send(error);
        }
        generateJWTToken(user.toJSON())
          .then((token) => {
            return res.json({ user, token });
          })
          .catch((error) => {
            return res.send(error);
          });
      });
    })(req, res);
  });
}