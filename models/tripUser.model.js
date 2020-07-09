const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tripUserSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      require: true,
      ref: 'User',
    },
    isCustom: {
      type: Boolean,
      default: false,
    },
    trip_id: {
      type: Schema.Types.ObjectId,
      require: true,
      ref: 'trip',
    },
    create_date: {
      type: Date,
      default: Date.now(),
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
  { collection: 'tripUser' },
);

module.exports = mongoose.model('tripUser', tripUserSchema);
