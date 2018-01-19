global.APP_DIR = __dirname;

const express = require('express'),
  _ = require('lodash'),
  conf = require('./config/config'),
  Routes = require('./routes'),
  bodyParser = require('body-parser'),
  auth = require('./services/auth'),
  bunyan = require('bunyan'),
  passport = require('passport'),
  log = bunyan.createLogger({name: 'MHK.index'}),
  app = express(),
  cors = require('cors');

// console.log(require('util').inspect(auth, { showHidden: true, depth: null }));
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

// Rise up the server
app.listen(conf.server.port);
log.info(`App started on port ${conf.server.port}`);
