const os = require('os');
const errors = require('./errors');
const {CustomError, ErrorModel} = require('./errorModel');

module.exports = errors;

module.exports.middleware = app => {
  app.use((req, res, next) => {
    next(errors.endpointNotFoundError());
  });

  app.use((err, req, res, next) => {
    const error = err instanceof ErrorModel || err instanceof CustomError
      ? err : errors.unknownError(err);
    
    console.error('Error message: ', error.message);

    if (error.originalMessage) console.error('Error original message: ', error.originalMessage);
    console.error('Error stacktrace: ', error.stack.split(os.EOL).slice(1).map(item => item.trim()).join(os.EOL));

    res.status(error.status).json(error);
  }); 
};
