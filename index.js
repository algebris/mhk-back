global.APP_DIR = __dirname;

const express = require('express'),
  _ = require('lodash'),
  conf = require('./config/config'),
  bodyParser = require('body-parser'),
  auth = require('./services/auth'),
  bunyan = require('bunyan'),
  log = bunyan.createLogger({name: 'MHK.index'}),
  passport = require('passport'),
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

// multer = require('multer');
// const upload = multer({ dest: './uploads/', limits: '100MB' });

// app.post('/zzz', upload.single('avatar'), (req, res, next) => {
//   res.json(req.file, req.body, req.user);
// });

// Error handler loading
require('./services/errors').middleware(app);

// Rise up the server
app.listen(conf.server.port);
log.info(`App started on port ${conf.server.port}`);
