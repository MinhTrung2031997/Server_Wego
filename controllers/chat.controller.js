const Chat = require('../models/chat.model');
const formidable = require('formidable');
const os = require('os');

module.exports = {
  getAllMessage: (req, res, next) => {
    Chat.find({ trip_id: req.params.tripId })
      .populate('user_id_sender')
      .exec((err, messages) => {
        if (err) {
          res.json({
            result: 'failed',
            data: [],
            message: 'query failed',
          });
        } else {
          res.json({
            result: 'ok',
            data: messages,
            message: 'query successfully',
          });
        }
      });
  },
  saveImage: async (req, res, next) => {
    const form = new formidable.IncomingForm();
    form.uploadDir = './public/images/chatImages';
    form.keepExtensions = true;
    form.maxFieldsSize = 10 * 1024 * 1024;
    form.multiples = true;
    form.parse(req, async (err, fields, files) => {
      if (err) {
        res.json({
          result: 'failed',
          data: {},
          message: `cannot read file. Error is: ${err}`,
        });
      } else {
        const type = os.type() === 'Darwin' ? '/' : '\\';
        let imageURL = files.image.path.split(type).pop();
        let chat = new Chat({
          type: 2,
          trip_id: fields.tripId,
          user_id_sender: fields.userId,
          imageURL: imageURL,
        });
        await chat.save();
        Chat.findOne({ _id: chat._id })
          .populate('user_id_sender')
          .exec((err, data) => {
            res.json({
              result: 'ok',
              data: data,
              message: 'Save image chat successful',
            });
          });
      }
    });
  },
  audioRecording: async (req, res, next) => {
    const form = new formidable.IncomingForm();
    form.uploadDir = './public/images/audioRecordings';
    form.keepExtensions = true;
    form.maxFieldsSize = 10 * 1024 * 1024;
    form.multiples = true;
    form.parse(req, async (err, fields, files) => {
      if (err) {
        res.json({
          result: 'failed',
          data: {},
          message: `cannot read file. Error is: ${err}`,
        });
      } else {
        const type = os.type() === 'Darwin' ? '/' : '\\';
        let audioURL = files.audio.path.split(type).pop();
        let chat = new Chat({
          type: 4,
          trip_id: fields.tripId,
          user_id_sender: fields.userId,
          audio: {
            audioURL,
            soundDuration: parseInt(fields.soundDuration),
            soundPosition: parseInt(fields.soundPosition),
          },
        });
        await chat.save();
        Chat.findOne({ _id: chat._id })
          .populate('user_id_sender')
          .exec((err, data) => {
            res.json({
              result: 'ok',
              data: data,
              message: 'Save image chat successful',
            });
          });
      }
    });
  },
};
