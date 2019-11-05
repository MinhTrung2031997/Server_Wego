const mongoose = require('mongoose');
const UserActivity = require('../models/userActivity.model');

module.exports = {
    getAllUserActivity: (req, res, next) => {
        UserActivity.find()
            .populate('user_id')
            .populate('list_user.user_id')
            .populate('transaction_id')
            .populate('trip_id')
            .exec((err, data) => {
              if(err){
                  res.json({err})
              } else {
                  res.json({data})
              }
            })
    }
};
