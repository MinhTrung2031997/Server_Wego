const PlaceLocation = require('../models/placeLocation.model');

module.exports = {
  getAllPlaceLocation: (req, res, next) => {
    {
      PlaceLocation.find({ trip_id: req.params.tripId }).exec((err, locations) => {
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
};
