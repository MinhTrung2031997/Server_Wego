const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const transactionSchema = new Schema({
    name: {
        type: String,
        require: true
    },
    amount: {
        type: Number,
        require: true
    },
    trip_id: {
        type: Schema.Types.ObjectId,
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
}, {collection: 'transaction'});

transactionSchema.path('name').set((inputString) => {
    return inputString[0].toUpperCase() + inputString.slice(1);
});
module.exports = mongoose.model('transaction', transactionSchema);
