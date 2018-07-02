const Promise = require('bluebird'),
  _ = require('lodash'),
  places = require('./places');

class Answer {
  constructor(obj) {
    this.obj = places[obj.placeid] || {status:'ZERO_RESULTS'};
  }
  asPromise () {
    return Promise.resolve(this.obj);
  }
}

module.exports = {
  place: obj => new Answer(obj)
};
