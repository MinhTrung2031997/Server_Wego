const PlaceLocation = require('../models/placeLocation.model');

module.exports = {
  getAllPlaceLocation: (req, res, next) => {
    {
      PlaceLocation.find({ trip_id: req.params.tripId })
        .populate('user_id_sender')
        .exec((err, messages) => {
          if (err) {
            res.json({
              result: 'failed',
              data: [],
              message: 'query failed',
            });
          } else {
            res.json({
              result: 'ok',
              data: messages,
              message: 'query successfully',
            });
          }
        });
    }
  },
};
