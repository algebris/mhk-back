const express = require('express'),
  config = require('./config/config'),
  Routes = require('./routes'),
  bodyParser = require('body-parser'),
  auth = require('./utils/auth'),
  bunyan = require('bunyan'),
  log = bunyan.createLogger({name: 'MHK.index'}),
  app = express(),
  cors = require('cors');

// console.log(require('util').inspect(auth, { showHidden: true, depth: null }));
require('dotenv').config();
require('./config/db');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

app.use(auth.initialize);
require('./routes')(app);

app.use((err, req, res, next) => {
  if(process.env.NODE_ENV == 'development') {
    console.error(err);
  } else {
    log.error(err.message);
  }
  res.status(500).json({ success:false, message:'Server error' });  
});

app.listen(process.env.SERVER_PORT || config.server.port);
log.info(`App started on port`);
