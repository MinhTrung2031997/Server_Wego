const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const transactionUserSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    transaction_id: {
        type: Schema.Types.ObjectId,
        require:true,
        ref: 'transaction'
    },
    type:{
      type: Number,
      default:0
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
    delete_date:{
        type: Date,
        default:""
    }
}, {collection:'transactionUser'});

module.exports = mongoose.model('transactionUser', transactionUserSchema);
