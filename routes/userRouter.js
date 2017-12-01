const express = require('express'),
  router = express.Router();

router.get('/', (req, res) => {
  console.log('here');
  res.json({route: 'root'});
});

module.exports = router;