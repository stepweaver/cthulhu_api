const jwtSecret = 'your_jwt_secret'; // This has to be the same key used in the JWTStrategy

const jwt = require('jsonwebtoken');
const passport = require('passport');
const util = require('util');

require('./passport.js');

let generateJWTToken = (user) => {
  return jwt.sign(user, jwtSecret, {
      subject: user.Username, // This is the username you're encoding in the JWT
      expiresIn: '7d', // This specifies that the token will expire in 7 days
      algorithm: 'HS256' // This is the algorithm used to "sign" or encode the values of the JWT
    });
  };

/* POST login*/
module.exports = (router) => {
  router.post('/login', (req, res) => {
    return new Promise((resolve, reject) => {
      passport.authenticate('local', { session: false }, async (err, user, info) => {
        try {
          if (err || !user) {
            return reject({ status: 400, message: 'Something is not right', user: user });
          }
          req.login(user, { session: false }, async (error) => {
            if (error) {
              return reject({ status: 400, message: 'Something is not right', error: error.message });
            }
            let token = generateJWTToken(user.toJSON());
            return resolve({ status: 200, data: { user, token } });
          });
        } catch (error) {
          return reject({ status: 400, message: 'Something is not right', error: error.message });
        }
      })(req, res);
    })
      .then(response => {
        return res.status(response.status).json(response.data);
      })
      .catch(error => {
        return res.status(error.status).json({ message: error.message, error: error.error });
      });
  });
};