const mongoose = require('mongoose');
const UserActivity = require('../models/userActivity.model');
const TripUser = require('../models/tripUser.model');

module.exports = {
  getAllUserActivity: async (req, res, next) => {
    let userTrip = await TripUser.find({ user_id: req.params.userId });
    if (userTrip) {
      let data = [];
      for (let i = 0; i < userTrip.length; i++) {
        let userActivity1 = await UserActivity.find({ trip_id: userTrip[i].trip_id })
          .populate('user_id')
          .populate('transaction_id')
          .populate('trip_id');
        data = data.concat(userActivity1);
      }
      data.sort((a,b) => {
        return new Date(b.create_date) - new Date(a.create_date);
      });
      await res.json({ data });
    }
  },
};
