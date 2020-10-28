const PlanUser = require('../models/planUser.model');
const mongoose = require('mongoose');

module.exports = {
  createPlan: async (req, res, next) => {
    let {userId} = req.params;
    let {tripId, code, location, name} = req.body;
    let planUser = new PlanUser({
      user_id: userId,
      trip_id: tripId !== "" ? [tripId] : [],
      name: name,
      code: code,
      location: location
    });
    try {
      await planUser.save();
      res.send({data: 'done'});
    } catch (error) {
      res.send({data: error});
    }
  },
  getPlanByCode: async (req, res) => {
    let {userId, code} = req.params;
    let plan = await PlanUser.find({user_id: mongoose.Types.ObjectId(userId), code: code});
    res.send({data: plan});
  },
  getPlanByTripId: async (req, res) => {
    let {tripId} = req.params;
    let plan = await PlanUser.find({trip_id: tripId});
    res.send({data: plan});
  },
  getAllPlan: async (req, res) => {
    let {userId} = req.params;
    let plan = await PlanUser.find({user_id: mongoose.Types.ObjectId(userId)});
    res.send({data: plan});
  },
  deletePlan: async (req, res) => {
    let {planId} = req.params;
    await PlanUser.findOneAndDelete({_id: mongoose.Types.ObjectId(planId)});
    res.send({data: []});
  },
  removePlanInTrip: async (req, res) => {
    let {planId, tripId} = req.params;
    await PlanUser.updateOne({_id: mongoose.Types.ObjectId(planId)}, {$pullAll: { trip_id: [tripId]}})
    let plan = await PlanUser.find({trip_id: tripId});
    res.send({data: plan});
  },
  updatePlanInTrip: async (req, res) => {
    let {planId, name, location} = req.body
    await PlanUser.updateOne({_id: mongoose.Types.ObjectId(planId)}, {$set: { name: name, location: location}})
    res.send({data: []});
  },
  addPlanInTrip: async (req, res) => {
    let {listPlan, tripId} = req.body;
    let convertToObjectId = [...listPlan.map(item => mongoose.Types.ObjectId(item))];
    await PlanUser.updateMany({'_id': {$in : convertToObjectId}}, {"$push":{"trip_id": tripId}});
    res.send({data: []});
  },
  getPlanNoInTripByUserId: async (req, res) => {
    let {tripId, userId} = req.params;
    let plan = await PlanUser.find({user_id: mongoose.Types.ObjectId(userId), trip_id: {$nin: tripId}});
    res.send({data: plan});
  },
};
