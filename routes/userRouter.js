const express = require('express'),
  cfg = require('../config/config'),
  User = require('../models/userModel'),
  auth = require('../utils/auth'),
  multer = require('multer'),
  mailer = require('../utils/emailSender'),
  router = express.Router();

const upload = multer({ dest: cfg.storagePath, limits: '100MB' });

router.post('/', async (req, res, next) => {
  const user = await User.create(req.body)
    .catch(err => next(err));
  
  if(user) {
    res.json({email:user.email});
  }
});

router.post('/profile', auth.authenticate, upload.single('avatar'), (req, res, next) => {
  console.log(req.file, req.body, req.user);
  next(null)
});

router.post('/signup', async (req, res, next) => {
  const sent = await mailer.register()
    .then(r => res.json(r))
    .catch(err => next(err));
});

module.exports = router;
