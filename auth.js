const jwtSecret = 'your_jwt_secret'; // This has to be the same key used in the JWTStrategy

const jwt = require('jsonwebtoken'),
	passport = require('passport');
	
require('./passport'); // local passport file

let generateJWTToken = (user) => {
  return new Promise((resolve, reject) => {
    jwt.sign(user, jwtSecret, {
      subject: user.Username, // The username encoded in the JWT
      expiresIn: '7d',
      algorithm: 'HS256'
    }, (error, token) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });
  });
};

module.exports = (router) => {
  router.post('/login', (req, res) => {
    return new Promise((resolve, reject) => {
      passport.authenticate('local', { session: false }, (error, user, info) => {
        if (error || !user) {
          return reject({ status: 400, message: 'Something is not right', user: user });
        }
        req.login(user, { session: false }, (error) => {
          if (error) {
            return reject(error);
          }
          generateJWTToken(user.toJSON())
            .then((token) => {
              resolve({ user, token });
            })
            .catch((error) => {
              reject(error);
            });
        });
      })(req, res);
    })
      .then((response) => {
        return res.json(response);
      })
      .catch((error) => {
        return res.status(error.status || 500).json({ message: error.message || 'Internal Server Error' });
      });
  });
};