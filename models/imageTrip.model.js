const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const imageTripSchema = new Schema(
  {
    trip_id: {
      type: Schema.Types.ObjectId,
      require: true,
      ref: 'trip',
    },
    imageURL: {
      type: String,
      require: true,
    },
    isDelete: {
      type: Boolean,
      default: false,
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
  { collection: 'imageTrip' },
);

module.exports = mongoose.model('imageTrip', imageTripSchema);
