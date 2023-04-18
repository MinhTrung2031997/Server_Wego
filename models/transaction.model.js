const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const transactionSchema = new Schema(
  {
    name: {
      type: String,
      require: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      require: true,
      ref: 'User',
    },
    amount: {
      type: Number,
      require: true,
    },
    trip_id: {
      type: Schema.Types.ObjectId,
      require: true,
      ref: 'trip',
    },
    namePayer: {
      type: String,
      require: false,
    },
    moneyPayer: {
      type: Number,
      require: false,
    },
    list_user: [
      {
        user_id: {
          type: Schema.Types.ObjectId,
          require: false,
          ref: 'User',
        },
        type: {
          type: Number,
          require: false,
        },
        amount_user: {
          type: Number,
          require: false,
        },
      },
    ],
    avatar: {
      type: String,
    },
    imageURL: {
      type: Array,
    },
    address: {
      type: String,
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
  { collection: 'transaction' },
);

transactionSchema.path('name').set((inputString) => {
  return inputString[0].toUpperCase() + inputString.slice(1);
});
module.exports = mongoose.model('transaction', transactionSchema);
