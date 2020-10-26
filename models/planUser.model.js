const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const planUserSchema = new Schema(
  {
    trip_id: {
      type: Array,
      default: [],
    },
    user_id: {
      type: Schema.Types.ObjectId,
      require: true,
      ref: 'User',
    },
    name: {
      type: String,
      required: true,
    },
    code: {
      type: Number,
      require: true,
    },
    location: {
      type: Array,
      default: [],
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
  { collection: 'planUser' },
);

module.exports = mongoose.model('planUser', planUserSchema);
