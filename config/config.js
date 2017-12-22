require('dotenv').config();

module.exports = {
  storagePath: 'uploads/',
  siteUrl: 'http://mhk.onsib.ru',
  emailFrom: `info@mhk.onsib.ru`,
  db: process.env.MONGO_URI || 'mongodb://localhost:27017/mhk',
  apiPrefix: '/api/v1',
  server: {
    port: 8080
  },
  auth: {
    jwtSecret: 'oefjerijeprfijerpfoijerpf'
  }
};