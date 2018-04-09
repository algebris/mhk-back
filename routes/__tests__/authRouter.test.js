/* eslint-env jest */

const request = require('supertest');
const app = require('../../app');
const endPoint = '/api/vi';
const JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFsZy5lYnJpc0BnbWFpbC5jb20iLCJpYXQiOjE1MTY5ODE0MDV9.KejEU1ZcofnWM-KPNvpKlmS4P0nHVfUglFzcfB8rCJI';

describe(`Endpoint ${endPoint}`, () => {
  test('It should response the GET method with object', async () => {
    request(app)
      .get('/api/v1/auth')
      .set(
        'Authorization', 
        `JWT ${JWT}`)
      .expect('Content-Type', /json/)
      .expect(200, {
        success: true
      });
  });
});
