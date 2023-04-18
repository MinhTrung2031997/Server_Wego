const mongoose = require('mongoose');
const ImageTrip = require('../models/imageTrip.model');

module.exports = {
  getImagebyTripId: (req, res, next) => {
    ImageTrip.find({ trip_id: req.params.tripId }).exec((err, images) => {
      if (err) {
        res.json({
          result: 'failed',
          data: [],
          message: 'query failed',
        });
      } else {
        res.json({
          result: 'ok',
          data: images,
          message: 'query successfully',
        });
      }
    });
  },
};
