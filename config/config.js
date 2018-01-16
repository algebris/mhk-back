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
    strategies: ['local', 'jwt', 'vkontakte', 'facebook'],
    jwtSecret: process.env.JWT_SECRET || '',
    fb: {
      id: process.env.FB_ID || '',
      secret: process.env.FB_SECRET || '',
    },
    vk: {
      id: process.env.VK_ID || '',
      secret: process.env.VK_SECRET || '',
    }
  }
};