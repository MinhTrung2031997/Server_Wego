const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const activityTransactionSchema = new Schema({
    name: {
        type: String,
        require: true
    },
    author: {
        type: Schema.Types.ObjectId,
        require: true,
        ref: 'User'
    },
    amount: {
        type: Number,
        require: true
    },
    trip_id: {
        type: Schema.Types.ObjectId,
        require: true,
        ref: 'trip'
    },
    create_date: {
        type: Date,
        default: Date.now()
    },
    update_date: {
        type: Date,
        default: ""
    },
    delete_date: {
        type: Date,
        default: ""
    }
}, {collection: 'activityTransaction'});

activityTransactionSchema.path('name').set((inputString) => {
    return inputString[0].toUpperCase() + inputString.slice(1);
});
module.exports = mongoose.model('activityTransaction', activityTransactionSchema);
