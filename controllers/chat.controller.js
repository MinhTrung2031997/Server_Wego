const Chat = require('../models/chat.model');

module.exports = {
    getAllMessage: (req, res, next) => {
        Chat.find({trip_id: req.params.tripId})
            .populate('user_id_sender')
            .exec((err, messages) => {
                if (err) {
                    res.json({
                        result: "failed",
                        data: [],
                        message: "query failed"
                    })
                } else {
                    res.json({
                        result: "ok",
                        data: messages,
                        message: "query successfully"
                    })
                }
            })
    }
};
