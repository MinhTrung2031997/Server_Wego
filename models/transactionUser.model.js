const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const transactionUserSchema = new Schema({
    list_user:[
        {
            type: Schema.Types.ObjectId,
            require:true,
            ref:'User'
        },
        {
           type: Number,
            require: true
        }
    ],
    user_id: {
        type: Schema.Types.ObjectId,
        require:true,
        ref: 'User'
    },
    transaction_id: {
        type: Schema.Types.ObjectId,
        require:true,
        ref: 'transaction'
    },
    amount_user: {
        type: Number,
        require: true
    },
    type:{
      type: Number,
      default:0
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
