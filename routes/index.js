const requireAll = require('require-all');

let routes = requireAll({
  dirname: __dirname,
  recursive: true,
  filter: /^(.+Router)\.js$/
});

module.exports = app => {
  app.get('/', (req, res) => res.json({status: 0, message: 'MHK API alive!'}));
  app.use('/user', routes.userRouter);
  app.use('/auth', routes.authRouter);
};
