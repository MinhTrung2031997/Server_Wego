const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userActivitySchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        require: true,
        ref: 'User'
    },
    transaction_id: {
        type: Schema.Types.ObjectId,
        ref: 'transaction',
    },
    trip_id: {
        type:Schema.Types.ObjectId,
        require: true,
        ref:'trip'
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
}, {collection: 'userActivity'});


module.exports = mongoose.model('userActivity',userActivitySchema);
