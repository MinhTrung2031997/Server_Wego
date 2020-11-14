const LocationUser = require('../models/locationUser.model');
const mongoose = require('mongoose');

module.exports = {
  CreateOrUpdateLocationUser: async (req, res, next) => {
    let {userId, latitude, longitude} = req.body;
    let locationUser = await LocationUser.findOne({user_id: mongoose.Types.ObjectId(userId)});
    if(locationUser){
      locationUser.latitude = latitude;
      locationUser.longitude = longitude;
      locationUser.update_date = Date.now();
      await locationUser.save();
    }else{
      let newLocationUser = new LocationUser({
        user_id: userId,
        latitude: latitude,
        longitude: longitude,
      });
      await newLocationUser.save();
    }
    res.send({data: 'done'})
  }
};
