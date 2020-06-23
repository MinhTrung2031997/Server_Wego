const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const chatSchema = new Schema({
    trip_id: {
        type: Schema.Types.ObjectId,
        require: true,
        ref: 'trip'
    },
    user_id_sender: {
        type: Schema.Types.ObjectId,
        require: true,
        ref: 'User'
    },
    message: {
        type: String,
        require: true
    },
    isDelete: {
      type: Boolean,
      default: false
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

}, {collection: 'chat'});

module.exports = mongoose.model('chat', chatSchema);
