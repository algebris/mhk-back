const _ = require('lodash'),
  Promise = require('bluebird'),
  conf = require('../../config/config');

// const googleMapsClient = require('../googleStub');
const googleMapsClient = require('@google/maps').createClient({
  key: conf.googleApi.key,
  language: 'ru',
  Promise: Promise
});

const processResponse = res => {
  switch(res.status) {
    case 200: 
      return res;
    case 'ZERO_RESULTS' || 'NOT_FOUND': 
      throw new Error('Place not found');
    default:
      throw new Error(res.status);
  }
};

class Place {
  constructor(place_id) {
    this.id = String(place_id).trim();
    this.name = null;
    this.address = null;
    this.init();
  }

  init() {
    if(!this.validatePlaceId(this.id))
      throw new Error('Invalid place ID');
  }
  
  validatePlaceId(id) {
    return id.trim().match(/^[A-Za-z0-9-]{27}$/);
  }

  async lookup() {
    return await googleMapsClient.place({placeid: this.id})
      .asPromise()
      .then(processResponse)
      .then(res => {
        console.log(res);
        const locality = _.chain(res)
          .get('json.result.address_components', [])
          .filter(obj => 
            _.difference(['locality', 'political'], obj.types).length === 0)
          .get('[0].short_name')
          .value();

        this.name = locality;
        this.address = _.get(res, 'json.result.formatted_address');
        
        return this;
      });
  }
}

module.exports = {
  Place
};