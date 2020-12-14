const bcrypt = require('bcryptjs');
let fs = require('fs');
const mailer = require('../nodemailer/mailer');
const rn = require('random-number');
const { User } = require('../models/user.model');
const Trip = require('../models/trip.model');
const TripUser = require('../models/tripUser.model');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const formidable = require('formidable');
const os = require('os');

module.exports = {
  checkUserExists: async (req, res) => {
    let user = await User.find({ email: { $regex: req.body.email, $options: 'i' } });
    res.send({ data: user });
  },
  checkAuth: async (req, res) => {
    console.log(req.body);
    // First Validate The HTTP Request
    const { error } = validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.message });
    }

    //  Now find the user by their email address
    let user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(400).json({ error: 'Tài khoản không tồn tại' });
    } else {
      if (user.password) {
        // Then validate the Credentials in MongoDB match
        // those provided in the request
        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) {
          return res.status(400).json({ error: 'Mật khẩu không đúng. Vui lòng nhập lại' });
        }
        if (user.secretToken) {
          return res.status(400).json({ error: 'verify' });
        }
      } else {
        // Case user was signed in trip
        return res.status(400).json({ error: 'Bạn chưa đăng ký tài khoản. Vui lòng đăng ký trước khi đăng nhập' });
      }
    }

    const token = jwt.sign({ _id: user._id }, 'PrivateKey');
    res.status(200).json({ token });
  },
  getInfoUser: async (req, res) => {
    try {
      const { token } = req.body;
      // decode token retrieve id user
      let decoded = jwt.verify(token, 'PrivateKey');
      let userId = decoded._id;
      // Fetch the user by id
      let user = await User.findOne({ _id: userId });
      res.status(200).send(user);
    } catch (error) {
      return res.status(400).json({ error: 'Không thể lấy thông tin của người dùng.' });
    }
  },
  createUser: async (req, res) => {
    var gen = rn.generator({
      min: 10000,
      max: 99999,
      integer: true,
    });
    const secretToken = gen();
    const salt = await bcrypt.genSalt(10);
    const html = `Chào bạn,
            <br/>
            Cảm ơn bạn đã đăng ký tài khoản!
            <br/><br/>
            Vui lòng nhập mã pin trên để xác thực tài khoản:
            <br/>
            PIN: <b>${secretToken}</b>
            <br/>
            <br/><br/>
            Chúc bạn có một ngaày vui vẻ.`;

    // Check if this user already exists
    let user = await User.findOne({ email: req.body.email });
    if (user) {
      if (!user.password) {
        user.password = await bcrypt.hash(req.body.password, salt);
        user.secretToken = secretToken;
        user.name = req.body.name;
        user.active = false;
        user.save();
        res.json({
          result: 'ok',
          message: 'đăng ký thành công',
        });
        // Send email
        await mailer.sendEmail('minhtrung2031997@gmail.com', req.body.email, 'Vui lòng xác thực email!', html);
        return;
      } else {
        return res.status(400).json({ error: 'Email đã tôn tại.' });
      }
    } else {
      function getRandomInt(max) {
        return Math.floor(Math.random() * Math.floor(max));
      }

      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: await bcrypt.hash(req.body.password, salt),
        secretToken: secretToken,
        active: false,
        avatar: getRandomInt(6),
        isCustom: req.body.isCustom,
        token_notification: req.body.token_notification,
      });
      await newUser.save();
      res.json({
        result: 'ok',
        message: 'đăng ký thành công',
      });
      // Send email
      await mailer.sendEmail('minhtrung2031997@gmail.com', req.body.email, 'Vui lòng xác thực email!', html);
    }
  },
  updateTokenNotification: async (req, res) => {
    let { userId, token_notification } = req.body;
    let user = await User.findOne({ _id: mongoose.Types.ObjectId(userId) });
    if (user) {
      user.token_notification = token_notification;
      await user.save();
    }
    res.send({ data: 'done' });
  },
  verifyUser: async (req, res) => {
    try {
      const { secretToken } = req.body;
      // Find account with matching secret token
      const user = await User.findOne({ secretToken: secretToken });
      if (!user) {
        res.status(400).json({ error: 'Xin lỗi, mã pin không có giá trị' });
        return;
      }

      user.active = true;
      user.secretToken = '';
      await user.save();

      const token = jwt.sign({ _id: user._id }, 'PrivateKey');
      res.status(200).json({ token });
    } catch (error) {
      res.send(error);
    }
  },
  updateUser: async (req, res, next) => {
    let conditions = {};
    if (mongoose.Types.ObjectId.isValid(req.params.userId)) {
      conditions._id = mongoose.Types.ObjectId(req.params.userId);
    } else {
      res.json({
        result: 'failed',
        data: [],
        message: 'you must enter user_id to update',
      });
    }
    const form = new formidable.IncomingForm();
    form.uploadDir = './public/images/avatars';
    form.keepExtensions = true;
    form.maxFieldsSize = 10 * 1024 * 1024;
    form.multiples = true;
    form.parse(req, (err, fields, files) => {
      console.log(req.params.userId);
      if (err) {
        res.json({
          result: 'failed',
          data: {},
          message: `cannot read file. Error is: ${err}`,
        });
      } else {
        if (fields.isCheck === '0') {
          let newValues = {
            name: fields.name,
            email: fields.email,
            update_date: Date.now(),
          };
          const options = {
            new: true,
            multi: true,
          };
          User.findOneAndUpdate(conditions, { $set: newValues }, options, (err, updateUser) => {
            if (err) {
              res.json({
                result: 'failed',
                data: [],
                message: `Cannot update User with ${req.params.userId}. Error is: ${err}`,
              });
            } else {
              res.json({
                result: 'ok',
                data: updateUser,
                message: 'update a user successfully',
              });
            }
          });
        } else {
          const type = os.type() === 'Darwin' ? '/' : '\\';
          let imageURL = files.image.path.split(type).pop();
          let newValues = {
            name: fields.name,
            email: fields.email,
            avatar: imageURL,
            uploadAvatar: true,
            update_date: Date.now(),
          };
          const options = {
            new: true,
            multi: true,
          };
          User.findOneAndUpdate(conditions, { $set: newValues }, options, (err, updateUser) => {
            if (err) {
              res.json({
                result: 'failed',
                data: [],
                message: `Cannot update User with ${req.params.userId}. Error is: ${err}`,
              });
            } else {
              res.json({
                result: 'ok',
                data: updateUser,
                message: 'update a user successfully',
              });
            }
          });
        }
      }
    });

    // let conditions = {};
    // if (mongoose.Types.ObjectId.isValid(req.params.userId)) {
    //   conditions._id = mongoose.Types.ObjectId(req.params.userId);
    // } else {
    //   res.json({
    //     result: 'failed',
    //     data: [],
    //     message: 'you must enter user_id to update',
    //   });
    // }
    // const email = req.body.email;
    // let user = await User.findOne({ email: email });
    // if (user && user._id != req.params.userId) {
    //   res.json({
    //     result: 'failed',
    //     data: [],
    //     message: 'Email exists, Please enter another email.',
    //   });
    //   return;
    // }
    // let newValues = {};
    // if (req.body.name && req.body.name.length > 2) {
    //   newValues = {
    //     name: req.body.name,
    //     email: req.body.email,
    //     update_date: Date.now(),
    //   };
    // }
    // const options = {
    //   new: true,
    // };
    // User.findOneAndUpdate(conditions, { $set: newValues }, options, (err, updateUser) => {
    //   if (err) {
    //     res.json({
    //       result: 'failed',
    //       data: [],
    //       message: `Cannot update User with ${req.params.userId}. Error is: ${err}`,
    //     });
    //   } else {
    //     res.json({
    //       result: 'ok',
    //       data: updateUser,
    //       message: 'update a user successfully',
    //     });
    //   }
    // });
  },
  uploadAvatar: async (req, res, next) => {
    let formidable = require('formidable');
    let form = new formidable.IncomingForm();
    form.uploadDir = './uploads';
    form.keepExtensions = true;
    form.maxFieldsSize = 10 * 1024 * 1024;
    form.multiples = true;
    form.parse(req, async (err, fields, files) => {
      if (err) {
        await res.json({
          result: 'failed',
          data: [],
          message: `cannot up load images. Error is ${err}`,
        });
      } else {
        let uri = files.photo.path.split('\\')[1];
        await res.json({
          result: 'ok',
          data: uri,
          numberOfImages: 1,
          message: 'Successfully images to upload!',
        });
        await User.findOneAndUpdate(
          {
            _id: mongoose.Types.ObjectId(req.params.userId),
          },
          {
            $set: {
              avatar: uri,
              uploadAvatar: true,
              update_date: Date.now(),
            },
          },
          {
            options: {
              new: true,
              multi: true,
            },
          },
        );
      }
    });
  },
  getImage: (req, res, next) => {
    const fileName = req.params.name;
    console.log(fileName);
    if (!fileName) {
      return res.send({
        status: false,
        message: 'no filename specified',
      });
    }

    res.sendfile(path.resolve(`./uploads/${fileName}`));
  },
  sendMoneyAllMail: async (req, res, next) => {
    const tripId = req.params.tripId;
    let arrMail = await TripUser.find({ trip_id: mongoose.Types.ObjectId(req.params.tripId) }).populate('user_id');
    const html = `Nhấp vào liên kết để xem tổng chi phí chuyến đi: <a href="http://localhost:3001/api/index/sendMailTotalMoney/${tripId}">Nhấn tại đây</a>`;
    for (let i = 0; i < arrMail.length; i++) {
      await mailer.sendEmail('minhtrung2031997@gmail.com', arrMail[i].user_id.email, 'Tổng chi phí chuyến đi.', html);
    }
    await res.json(arrMail.length);
  },
  remindPaymentUser: async (req, res, next) => {
    const { tripId, userIdReminded, amountUserRemind } = req.body;
    let trip = await Trip.findOne({ _id: mongoose.Types.ObjectId(tripId) });
    let userRemind = await User.findOne({ _id: mongoose.Types.ObjectId(trip.author) });
    let userReminded = await User.findOne({ _id: mongoose.Types.ObjectId(userIdReminded) });
    let title = `Vui lòng thanh toán số tiền bạn nợ trong chuyến đi ${trip.name}`;
    const html = `Số tiền bạn đang nợ: <strong style="color: red">${amountUserRemind} VNĐ</strong>
          <p>Nhấp vào liên kết để xem tổng chi phí chuyến đi: <a href="http://localhost:3001/api/index/sendMailTotalMoney/${trip._id}">Nhấn tại đây</a></p>`;
    await mailer.sendEmail(userRemind.email, userReminded.email, title, html);
    await res.json('ok');
  },
};

function validate(req) {
  const schema = {
    email: Joi.string()
      .min(5)
      .max(255)
      .required()
      .email({ minDomainAtoms: 2 })
      .error(new Error('email không có giá trị')),
    password: Joi.string().min(5).max(255).required().error(new Error('Mật khauir phải có ít nhất 5 ký tư')),
  };

  return Joi.validate(req, schema);
}
