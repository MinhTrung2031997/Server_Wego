const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tripUserSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    trip_id: {
        type: Schema.Types.ObjectId,
        ref: 'trip'
    },
    amount: {
        type: Number,
        require: true
    },
    create_date: {
        type: Date,
        default: Date.now,
    },
    update_date: {
        type: Date,
        default: ""
    },
    delete_date: {
        type: Date,
        default: ""
    }
}, {collection: 'tripUser'});


module.exports = mongoose.model('tripUser', tripUserSchema);
