let obj = {};

obj.getPayload = user => (
  { email: user.email }
);

module.exports = obj;