const mongoose = require('mongoose');
const UserAction = require('../models/userAction.model');

module.exports = {
    getAllUserAction: (req, res, next) => {
        UserAction.find()
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
