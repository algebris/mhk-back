const _ = require('lodash'),
  fs = require('fs'),
  config = require('../../config/config'),
  ejs = require('ejs'),
  nodeMailer = require('nodemailer'),
  directTransport = require('nodemailer-direct-transport'),
  stubTransport = require('nodemailer-stub-transport'),
  transport = process.env.NODE_ENV == 'development' ?
    nodeMailer.createTransport(stubTransport()) :
    nodeMailer.createTransport(directTransport({}));

const getTemplate = file =>
  fs.readFileSync(__dirname + `/templates/${file}`).toString();

const sendMail = async opts => {
  let options = {
    from: config.emailFrom, 
  };
  
  if(!opts.subject || !opts.to || (!opts.html || opts.text))
    return Promise.reject(`Fields Subject, Text or HTLM shouldn't be empty`)

  return transport.sendMail(_.assign(options, opts), (err, info) => {
    if(process.env.NODE_ENV == 'development') {
      console.log(info.response.toString());
    }
  });
};

const signupLetter = async (email, hash) => {
  const template = getTemplate('signup.html'),
    data = {
      siteUrl: `${config.siteUrl}${config.apiPrefix}/user/signup?key=${hash}`,
      emailFrom: config.emailFrom
    },
    opts = {
      to: email,
      subject: 'MHK sign up letter',
      html: ejs.render(template, data)
    };

  return sendMail(opts);
};

module.exports = {
  sendMail,
  signupLetter
};