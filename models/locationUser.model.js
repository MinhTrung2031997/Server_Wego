const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const locationUserSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      require: true,
      ref: 'User',
    },
    latitude : {
      type: Number,
      default: null,
    },
    longitude : {
      type: Number,
      default: null,
    },
    create_date: {
      type: Date,
      default: Date.now,
    },
    update_date: {
      type: Date,
      default: '',
    },
    delete_date: {
      type: Date,
      default: '',
    },
  },
  { collection: 'locationUser' },
);

module.exports = mongoose.model('locationUser', locationUserSchema);
