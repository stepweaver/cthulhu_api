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
  router.post('/login', async (req, res) => {
    try {
      const [user, info] = await util.promisify(passport.authenticate('local', { session: false }))(req, res);
      if (!user) {
        return res.status(400).json({
          message: 'Something is not right',
          user: user
        });
      }
      req.login(user, { session: false }, async (error) => {
        if (error) {
          res.send(error);
        }
        let token = generateJWTToken(user.toJSON());
        return res.json({ user, token });
      });
    } catch (error) {
      return res.status(400).json({
        message: 'Something is not right',
        error: error.message
      });
    }
  });
};