const express = require('express'),
  auth = require('../utils/auth'),
  passport = require('passport'),
  router = express.Router();

router.post('/login', async(req, res, next) => {
  await passport.authenticate('local', (err, user) => {
    console.log('***', user);
    req.user = {};
    if(user == false) {
      req.user.body = 'Login failed';
    } else {
      const payload = {
        id: user.id,
        displayName: user.displayName,
        email: user.email
      },
      token = jwt.sign(payload, jwtSecret);
      
      req.user.body = {user: displayName, token: 'JWT '+ token};
    }
  });
  next()
});

module.exports = router;