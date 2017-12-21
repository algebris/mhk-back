const requireAll = require('require-all'),
  cfg = require('../config/config');

let routes = requireAll({
  dirname: __dirname,
  recursive: true,
  filter: /^(.+Router)\.js$/
});

module.exports = app => {
  app.get(`/`, (req, res) => res.json({status: 0, message: 'MHK API alive!'}));
  app.use(`${cfg.apiPrefix}/user`, routes.userRouter);
  app.use(`${cfg.apiPrefix}/`, routes.authRouter);
};
