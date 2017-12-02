const express = require('express'),
  User = require('../models/userModel'),
  auth = require('../utils/auth'),
  router = express.Router();

router.post('/', async(req, res, next) => {
  const user = await User.create(req.body)
    .catch(err => next(err));
  
  if(user) {
    res.json({email:user.email});
  }
});

module.exports = router;
