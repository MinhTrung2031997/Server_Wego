const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tripSchema = new Schema(
  {
    name: {
      type: String,
      require: true,
      trim: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      require: true,
      ref: 'User',
    },
    oweUser: {
      type: Number,
      default: 0,
    },
    membersTrip: {
      type: Number,
      required: true,
    },
    // begin_date: {
    //     type: String,
    //     default: ""
    // },
    // end_date: {
    //   type: String,
    //   default:""
    // },
    avatarGroup: {
      type: String,
      default: '',
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
  { collection: 'trip' },
);

tripSchema.path('name').set((inputString) => {
  return inputString[0].toUpperCase() + inputString.slice(1);
});
module.exports = mongoose.model('trip', tripSchema);
