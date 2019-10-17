const Trip = require("../models/trip.model");
const mongoose = require('mongoose');

module.exports = {
  getAllTrip: (req, res, next) => {
      Trip.find()
          .then(trip => {
              res.json({
                  result: "ok",
                  data: trip,
                  message: "Query list if trip successfully"
              })
          })
          .catch(err => {
              res.json({
                  result: "failed",
                  data: [],
                  message: `error is : ${err}`
              })
          })
  },
  createTrip: async (req, res, next) => {

      let name = await Trip.findOne({name: req.body.name});
      if (name) {
          return res.status(400).json({error: "trip is exits"});
      }

      let trip = new Trip(req.body);
      trip.save()
          .then(item => {
              res.json({
                  result: "ok",
                  data: item,
                  message: "Insert new food Successfully"
              })
          })
          .catch(err => {
              res.status(400).send(`error is :${err}`);
          });

  },
  updateTrip:  async (req, res, next) => {
      let conditions = {}; // search record with "conditions" update
      if (mongoose.Types.ObjectId.isValid(req.params.tripId))//check food_id ObjectId ?
      {
          conditions._id = mongoose.Types.ObjectId(req.params.tripId);//object want update
      } else {
          res.json({
              result: "failed",
              data: [],
              message: "You must enter food_id to update"
          })
      }
      let newValues = {};
      if (req.body.name && req.body.name.length > 2 && req.body.amount) {
          // newValues.name = req.body.name;
          // newValues.amount = req.body.amount;
          newValues = {
              name : req.body.name,
              amount: req.body.amount
          }
      } else {
          return  res.status(400).json({error: "not be empty"});
      }
      const options = {
          new: true,
          multi: true
      };
      Trip.findOneAndUpdate(conditions, {$set: newValues}, options, (err, updateTrip) => {
          if (err) {
              res.json({
                  result: "Failed",
                  data: [],
                  message: `Cannot update existing food.Error is: ${err}`
              })
          } else {
              res.json({
                  result: "ok",
                  data: updateTrip,
                  message: "Update food successfully"
              })
          }
      })
  },
  deleteTrip: (req,res,next) => {
      Trip.findOneAndRemove({_id: mongoose.Types.ObjectId(req.params.tripId)}, (err) => {
          if (err){
              res.json({
                  result:"failed",
                  data:[],
                  message:`Cannot delete  tripId ${req.params.tripId} Error is : ${err}`
              })
          }
          res.json({
              result:"ok",
              message:"Delete trip successfully"
          })
      })
  }
};
