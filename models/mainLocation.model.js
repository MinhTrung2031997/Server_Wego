const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const mainLocationSchema = new Schema(
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
    },
    noAccent : {
      type: String,
      required: true,
    }
  },
  { collection: 'mainLocation' },
);

module.exports = mongoose.model('mainLocation', mainLocationSchema);
