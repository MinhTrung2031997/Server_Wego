const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const chatSchema = new Schema(
  {
    trip_id: {
      type: Schema.Types.ObjectId,
      require: true,
      ref: 'trip',
    },
    user_id_sender: {
      type: Schema.Types.ObjectId,
      require: true,
      ref: 'User',
    },
    type: {
      type: Number,
      require: true,
    },
    message: {
      type: String,
      default: '',
    },
    imageURL: {
      type: String,
      default: '',
    },
    audio: {
      audioURL: {
        type: String,
        default: '',
      },
      soundDuration: {
        type: Number,
        default: null,
      },
      soundPosition: {
        type: Number,
        default: null,
      },
      isPlaying: {
        type: Boolean,
        default: false,
      },
    },
    location: {
      longtitude: {
        type: Number,
        default: null,
      },
      latitude: {
        type: Number,
        default: null,
      },
      isShareLocation: {
        type: Boolean,
      },
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
  { collection: 'chat' },
);

module.exports = mongoose.model('chat', chatSchema);
