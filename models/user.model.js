const Joi = require('joi');
const mongoose = require('mongoose');

const UserModel = mongoose.model(
  'User',
  new mongoose.Schema(
    {
      name: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 50,
        trim: true,
      },
      email: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 255,
        unique: true,
        trim: true,
      },
      password: {
        type: String,
        default: '',
      },
      avatar: {
        type: String,
        default: '',
      },
      uploadAvatar: {
        type: Boolean,
        default: false,
      },
      secretToken: String,
      active: Boolean,
      pinCode: String,
      create_date: {
        type: Date,
        default: Date.now,
      },
      totalBalanceTrip: {
        type: Number,
        default: 0,
      },
      token_notification: {
        type: String,
        default: '',
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
    { collection: 'user' },
  ),
);

function validateUser(user) {
  const schema = {
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().min(5).max(255).required().email({ minDomainAtoms: 2 }),
  };
  return Joi.validate(user, schema);
}

exports.User = UserModel;
exports.validate = validateUser;
