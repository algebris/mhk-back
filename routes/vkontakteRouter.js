const express = require('express'),
  passport = require('passport'),
  config = require(`${APP_DIR}/config/config`);

router = express.Router();

router.get('/',
  passport.authenticate('vkontakte', {display: 'mobile', scope: ['email']})
);

router.get('/callback', (req, res, next) => {
  passport.authenticate('vkontakte', (err, user) => {
    if (err) { return next(err); }
    // if (!user) { return res.status(403).json({ success: false, message:'Bad Credentials' })}
    const token = jwt.sign({email:user.email}, config.auth.jwtSecret);
    res.json(token);
  })(req, res, next);
});

module.exports = router;