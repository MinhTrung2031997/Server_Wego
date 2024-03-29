const moongose = require('mongoose');
const { number } = require('joi');
const Schema = moongose.Schema;

const placeLocationSchema = new Schema(
  {
    trip_id: {
      type: Schema.Types.ObjectId,
      require: true,
      ref: 'trip',
    },
    author: {
      type: Schema.Types.ObjectId,
      require: true,
      ref: 'User',
    },
    imageURL: {
      type: Array,
      default: [],
    },
    nameTransaction: {
      type: String,
      default: '',
    },
    amountTransaction: {
      type: Number,
      default: 0,
    },
    address: {
      type: String,
      required: true,
    },
    latitude: {
      type: Number,
      require: true,
    },
    longitude: {
      type: Number,
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
  { collection: 'placeLocation' },
);

module.exports = moongose.model('placeLocation', placeLocationSchema);
