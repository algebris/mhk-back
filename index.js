const app = require('./app'),
  bunyan = require('bunyan'),
  log = bunyan.createLogger({name: 'MHK.index'}),
  conf = require('./config/config');

// Rise up the server
app.listen(conf.server.port);
log.info(`App started on port ${conf.server.port}`);
