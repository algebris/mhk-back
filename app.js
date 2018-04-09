global.APP_DIR = __dirname;

const express = require('express'),
  _ = require('lodash'),
  conf = require('./config/config'),
  bodyParser = require('body-parser'),
  auth = require('./services/auth'),
  // bunyan = require('bunyan'),
  // log = bunyan.createLogger({name: 'MHK.index'}),
  passport = require('passport'),
  app = express(),
  cors = require('cors');

require('./config/db');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

// Passport strategies loading
const strats = _.pick(auth.strategies, conf.auth.strategies);
for(const strategy in strats) {
  passport.use(auth.strategies[strategy]);
}
app.use(passport.initialize());

// Routes loading
require('./routes')(app);

// Error handler loading
require('./services/errors').middleware(app);

module.exports = app;