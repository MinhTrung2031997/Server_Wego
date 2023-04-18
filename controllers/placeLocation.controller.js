const PlaceLocation = require('../models/placeLocation.model');
const Transaction = require('../models/transaction.model');
const axios = require('axios');
const KeyApi = require('../data/KeyApi');

const optimizeDirection = async (stops, index) => {
  if(index === KeyApi.length) return null;
  let data = await axios({
    method: 'GET',
    url: 'https://trueway-directions2.p.rapidapi.com/FindDrivingRoute',
    headers: {
      'content-type': 'application/octet-stream',
      'x-rapidapi-host': 'trueway-directions2.p.rapidapi.com',
      'x-rapidapi-key': KeyApi[index],
      useQueryString: true,
    },
    params: {
      optimize: 'true',
      stops: stops,
    },
  })
    .then((response) => {
      // if (response.data.route.geometry) response.data.route.geometry = ''; // remove detail coordinate because not use and slow api
      return response.data.route.geometry;
    })
    .catch((error) => {
      if(error.response.data.message){
        return optimizeDirection(stops, index+1); // recursive with next keyApi
      } else{
        return null;
      }
    });
  return data;
};

const getLatLngInArray = (array) => {
  let stops = array.reduce((acc, cur) => {
    //get latitude longitude in array
    if (acc.length == 0) {
      acc = acc + cur['latitude'] + ',' + cur['longitude'];
    } else {
      acc = acc + ';' + cur['latitude'] + ',' + cur['longitude'];
    }
    return acc;
  }, '');
  return stops;
};

module.exports = {
  getAllPlaceLocation: (req, res, next) => {
    {
      PlaceLocation.find({ trip_id: req.params.tripId })
        .populate('author')
        .exec((err, locations) => {
          if (err) {
            res.json({
              result: 'failed',
              data: [],
              message: 'query failed',
            });
          } else {
            res.json({
              result: 'ok',
              data: locations,
              message: 'query successfully',
            });
          }
        });
    }
  },

  direction: async (req, res, next) => {
    let stops = await getLatLngInArray(req.body);
    let direction = await optimizeDirection(stops, 0);
    if(direction){
      let coordinate = [];
      direction.coordinates.map((item) => {
        obj = {
          latitude: item[0],
          longitude: item[1],
        };
        coordinate.push(obj);
      });
      res.send({ data: coordinate });
    } else {
      res.send({ data: [] });
    }
    
  },
};
