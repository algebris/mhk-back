const nodeMailer = require('nodemailer'),
  transport = nodeMailer.createTransport('direct:', {debug: true});

const register = async email => 
  transport.sendMail({from:'james Bond', to:'algebris@gmail.com', subject:'test'+Date.now(),html:'<b>zorro</b>'});

module.exports = {register};