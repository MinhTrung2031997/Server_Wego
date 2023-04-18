const mongoose = require('mongoose');
const TripUser = require('../models/tripUser.model');
const LocationUser = require('../models/locationUser.model');
const { Expo } = require('expo-server-sdk');
const { User } = require('../models/user.model');

module.exports = {
    getAllUsersByTripId: (req, res, next) => {
        TripUser.find({trip_id: mongoose.Types.ObjectId(req.params.tripId)})
            .populate('user_id')
            .exec((err, users) => {
                if (err) {
                    res.json({
                        result: "failed",
                        data: [],
                        message: "query failed"
                    })
                } else {
                    res.json({
                        result: "ok",
                        data: users,
                        message: "query successfully"
                    })
                }
            })
    },
    getAllLocationUserByTripId: async (req,res) => {
        let {tripId} = req.params;
        TripUser.find({trip_id: mongoose.Types.ObjectId(tripId)})
        .populate('user_id')
        .lean()
        .exec(async (err, users) => {
            if (err) {
                res.json({
                    result: "failed",
                    data: [],
                    message: "query failed"
                })
            } else {
                let newData = users.map(async el => {
                    let location = await LocationUser.findOne({user_id: mongoose.Types.ObjectId(el.user_id._id)}).lean();
                    if(location){
                        el.locationUser = location;
                    }else{
                        el.locationUser = {};
                    }
                    return el;
                })
                res.json({
                    result: "ok",
                    data: await Promise.all(newData),
                    message: "query successfully"
                })
            }
        })
    },
    pushNotificationRequestLocation: async (req, res) => {
        let {tripId, userId} = req.body;
        let tripUser = await TripUser.find({trip_id: mongoose.Types.ObjectId(tripId), user_id: {$nin: userId}})
        .populate('user_id')
        .lean()

        const user = await User.findOne({_id: mongoose.Types.ObjectId(userId)})
        if(tripUser){
            let expo = new Expo();
            // Create the messages that you want to send to clients
            let messages = [];
            for (let pushToken of tripUser) {
                if(pushToken.user_id.token_notification){ 
                    // Check that all your push tokens appear to be valid Expo push tokens
                    if (!Expo.isExpoPushToken(pushToken.user_id.token_notification)) {
                        console.error(`Push token ${pushToken} is not a valid Expo push token`);
                        continue;
                    }
                    // Construct a message (see https://docs.expo.io/push-notifications/sending-notifications/)
                    messages.push({
                        to: pushToken.user_id.token_notification,
                        sound: 'default',
                        title: 'Cập nhật vị trí',
                        data: {
                            content: `${user.name} muốn biết vị trí của bạn.`
                        },
                        body:  `${user.name} muốn biết vị trí của bạn.`
                    })
                }
            }
            let chunks = expo.chunkPushNotifications(messages);
            let tickets = [];
            (async () => {
            // Send the chunks to the Expo push notification service. There are
            // different strategies you could use. A simple one is to send one chunk at a
            // time, which nicely spreads the load out over time:
            for (let chunk of chunks) {
                try {
                let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
                console.log(ticketChunk);
                tickets.push(...ticketChunk);
                // NOTE: If a ticket contains an error code in ticket.details.error, you
                // must handle it appropriately. The error codes are listed in the Expo
                // documentation:
                // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
                } catch (error) {
                console.error(error);
                }
            }
            })();
        }
        res.send({data: 'done'})
    }
};
