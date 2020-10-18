const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const detailLocationSchema = new Schema(
  {
    url : {
      type: String,
      required: true,
    },
    title : {
      type: String,
      required: true,
    },
    desc : {
      type: String,
      required: true,
    },
    code : {
      type: Number,
      required: true,
      ref: 'mainLocation',
    },
    latitude : {
      type: Number,
      required: true,
    },
    longitude : {
      type: Number,
      required: true,
    },
    noAccent : {
      type: String,
      required: true,
    }
  },
  { collection: 'detailLocation' },
);

module.exports = mongoose.model('detailLocation', detailLocationSchema);
