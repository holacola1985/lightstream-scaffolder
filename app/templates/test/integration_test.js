'use strict';

var expect = require('chai').expect;
var _ = require('lodash');
var url = require('url');
var request = require('request');
var config = require('../config');
var ws = require('ws');

describe('Intergation Test', function() {

  var urlParam = {
    protocol: 'http',
    hostname: config.public.hostname,
    query: {
      api_key: config.api.key
    }
  };

  function getApiUrl(obj) {
    return url.format(_.extend(obj, urlParam));
  }


  describe('API status', function() {

    it('should answer', function(done) {
      request(getApiUrl({
        pathname: 'api/status'
      }), function(error, res, body) {
        expect(res.statusCode).to.be.equal(200);
        expect(JSON.parse(body)).to.be.deep.equal({
          status: 'ok'
        });
        done();
      });

    });

  });


  describe('fullstack test (post+ws)', function() {

    it('should POST an message and get it over websocket', function(done) {

      this.timeout(5000);

      var type = _.keys(config.elasticsearch.types)[0];
      var socket = new ws('ws://' + config.public.hostname + '/socket/');

      socket.once('open', function() {
        socket.send(JSON.stringify({
          event: 'bounding_box_initialized',
          type: type,
          bounding_box: [-180, -90, 180, 90]
        }));
        request({
          method: 'POST',
          uri: getApiUrl({
            pathname: 'api/items/' + type
          }),
          json: {
            item: {
              data: {},
              geojson: {
                type: 'Point',
                coordinates: [10, 20.5]
              }
            }
          }
        }, function(error, res) {
          expect(res.statusCode).to.be.equal(200);
        });
      });

      socket.once('message', function(message) {
        var item = JSON.parse(message);
        expect(item.geojson.coordinates[1]).to.be.equal(20.5);
        socket.close();
        done();
      });

    });

  });
});
