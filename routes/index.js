const requireAll = require('require-all'),
  cfg = require('../config/config');

let routes = requireAll({
  dirname: __dirname,
  recursive: true,
  filter: /^(.+)Router\.js$/
});

module.exports = app => {
  app.get(`/`, (req, res) => res.json({status: 0, message: 'MHK API alive!'}));
  app.use(`${cfg.apiPrefix}/user`, routes.user);
  app.use(`${cfg.apiPrefix}/`, routes.auth);
  
  if(cfg.auth.strategies.indexOf('vkontakte') !== -1)
    app.use(`${cfg.apiPrefix}/auth/vkontakte`, routes.vkontakte);
  
  if(cfg.auth.strategies.indexOf('facebook') !== -1)
    app.use(`${cfg.apiPrefix}/auth/facebook`, routes.facebook);

  app.use(`${cfg.apiPrefix}/`, routes.practice);

};
