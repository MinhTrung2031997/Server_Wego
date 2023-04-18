const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentRating = new Schema({
    title: {
      type:String,
      default: ""
    },
    user_id: {
        type: Schema.Types.ObjectId,
        require:true,
        ref:'User'
    },
    comment: {
      type: String,
        default:""
    },
    likes: {
      type: Number,
      default:0
    },
    dislikes: {
        type: Number,
        default: 0
    },
    rating:{
      type: Number,
      default:0
    },
    create_date: {
        type: Date,
        default: Date.now
    },
    update_date: {
        type: Date,
        default: ""
    },
    delete_date: {
        type: Date,
        default: ""
    }
}, {collection: 'commentRating'});


module.exports = mongoose.model('trip', commentRating);
