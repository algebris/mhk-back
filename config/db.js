const Mongoose = require('mongoose'),
  bunyan = require('bunyan'),
  Promise = require('bluebird'),
  log = bunyan.createLogger({name: "MHK.config.db"}),
  config = require('./config');

Mongoose.Promise = Promise;
Mongoose.connect(config.db, {useMongoClient: true});

const db = Mongoose.connection;
db.on('error', () => log.error('Database connection error'));
db.once('open', () => log.info('Connection with database succeeded'));

exports.db = db;