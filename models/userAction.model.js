const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userActionSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        require: true,
        ref: 'User'
    },
    transaction_id: {
        type: Schema.Types.ObjectId,
        ref: 'activityTransaction',
    },
    trip_id: {
        type:Schema.Types.ObjectId,
        require: true,
        ref:'activityTrip'
    },
    list_user: [
        {
            user_id: {
                type: Schema.Types.ObjectId,
                ref:'User'
            }
        }
    ],
    type:{
      type: String,
      require:true,
    },
    create_date: {
        type: Date,
    },
    added_date:{
      type: Date,
    },
    reduced_date:{
      type: Date
    },
    update_date: {
        type: Date,
    },
    delete_date: {
        type: Date,
    }
}, {collection: 'userAction'});


module.exports = mongoose.model('userAction', userActionSchema);
