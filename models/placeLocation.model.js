const moongose = require('mongoose');
const Schema = moongose.Schema;

const placeLocationSchema = new Schema
  ({
    trip_id: {
      type: Schema.Types.ObjectId,
      require: true,
      ref: 'trip',
    },
    latitude: {
      type: String,
      require: true,
    },
    longitude: {
      type: String,
      require: true,
    },
    isDelete: {
      type: Boolean,
      default: false,
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
  { collection: 'placeLocation' });

module.exports = moongose.model('placeLocation', placeLocationSchema);
