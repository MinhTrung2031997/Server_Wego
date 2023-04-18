const mongoose = require('mongoose');
const Transaction = require('../models/transaction.model');
const TransactionUser = require('../models/transactionUser.model');
const { User } = require('../models/user.model');
const TripUser = require('../models/tripUser.model');
const PlaceLocation = require('../models/placeLocation.model');
const ImageTrip = require('../models/imageTrip.model');
const formidable = require('formidable');
const fs = require('fs');
const os = require('os');

const UserActivity = require('../models/userActivity.model');

module.exports = {
  getAllTransaction: async (req, res, next) => {
    let transaction = await Transaction.find();
    let transactions = [];
    if (transaction) {
      for (let i = 0; i < transaction.length; i++) {
        if (transaction[i].isDelete === false) {
          transactions.push(transaction[i]);
        } else {
          console.log('deleted');
        }
      }
      await res.json(transactions);
    } else {
      await res.json({
        result: 'failed',
        data: [],
        message: 'query not successfully',
      });
    }
  },
  getTransactionByTripId: async (req, res, next) => {
    let listTransaction = [];
    let numberUserInTrip = 0;
    await TripUser.find({ trip_id: mongoose.Types.ObjectId(req.params.tripId) })
      .populate('user_id')
      .then((users) => {
        numberUserInTrip = users.length;
      });
    await Transaction.find({ trip_id: mongoose.Types.ObjectId(req.params.tripId) })
      .then((transactionByTripId) => {
        listTransaction = transactionByTripId;
      })
      .catch((err) => {
        console.log(err);
      });
    for (let i = 0; i < listTransaction.length; i++) {
      if (listTransaction[i].list_user.length > 0) {
        for (let j = 0; j < listTransaction[i].list_user.length; j++) {
          if (listTransaction[i].list_user[j].type > 0) {
            let user = await User.findOne({ _id: listTransaction[i].list_user[j].user_id });
            listTransaction[i].namePayer = user.name;
            listTransaction[i].moneyPayer = listTransaction[i].list_user[j].type;
          }
        }
      }
    }

    await res.json({
      numberUser: numberUserInTrip,
      data: listTransaction,
    });
  },
  createTransaction: async (req, res, next) => {
    function randomIntFromInterval(min, max) {
      return Math.floor(Math.random() * (max - min + 1) + min);
    }
    const serverName = require('os').hostname();
    const serverPort = require('../app').settings.port;
    console.log(serverName, serverPort);
    const form = new formidable.IncomingForm();
    form.uploadDir = './public/images/uploads';
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
      }
      let dataExpense = JSON.parse(fields.dataExpense);
      let dataLocation = JSON.parse(fields.dataLocation);
      let lengthDataExpense = Object.keys(dataExpense).length;
      let lengthDataLocation = Object.keys(dataLocation).length;
      let lengthDataImage = Object.keys(files).length;
      let trip_id = fields.trip_id;
      const type = os.type() === 'Windows_NT' ? '\\' : '/';
      if (lengthDataExpense > 0 && lengthDataLocation > 0 && lengthDataImage > 0) {
        let imageURL =
          files.image.length > 1
            ? files.image.map((item) => item.path.split(type).pop())
            : [files.image.path.split(type).pop()];
        let placeLocation = new PlaceLocation({
          trip_id: trip_id,
          author: dataExpense.author,
          imageURL: imageURL,
          nameTransaction: dataExpense.name,
          amountTransaction: dataExpense.amount,
          address: dataLocation.address,
          latitude: dataLocation.latitude,
          longitude: dataLocation.longitude,
        });
        await placeLocation.save();

        let imageTrip = new ImageTrip({
          trip_id: dataExpense.trip_id,
          imageURL: imageURL,
        });
        await imageTrip.save();
        let idForShare = {
          imgId: imageTrip._id,
          locationId: placeLocation._id,
        };
        let transaction = new Transaction({
          name: dataExpense.name,
          author: dataExpense.author,
          amount: dataExpense.amount,
          trip_id: trip_id,
          list_user: dataExpense.list_user,
          avatar: randomIntFromInterval(6, 9),
          imageURL: imageURL,
          address: dataLocation.address,
        });
        transaction
          .save()
          .then((transaction) => {
            res.json({
              result: 'ok',
              data: transaction,
              idForShare,
              message: 'save transaction successfully',
            });
            let list_user = dataExpense.list_user;
            for (let i = 0; i < list_user.length; i++) {
              if (list_user[i].type === -1) {
                let transactionUser = new TransactionUser({
                  user_id: list_user[i].user_id,
                  transaction_id: transaction._id,
                  trip_id: trip_id,
                  amount_user: list_user[i].amount_user,
                  type: list_user[i].type,
                  total: list_user[i].amount_user * list_user[i].type,
                });
                transactionUser.save();
              } else {
                console.log('Type 1');
              }
            }
            for (let i = 0; i < list_user.length; i++) {
              if (list_user[i].type !== -1) {
                let transactionUser = new TransactionUser({
                  user_id: list_user[i].user_id,
                  transaction_id: transaction._id,
                  trip_id: trip_id,
                  amount_user: list_user[i].amount_user,
                  type: list_user[i].type,
                  total: list_user[i].type - list_user[i].amount_user,
                });
                transactionUser.save();
              } else {
                console.log(`type -1`);
              }
            }
            let userCreateTransaction = new UserActivity({
              user_id: dataExpense.author,
              transaction_id: transaction._id,
              trip_id: trip_id,
              type: 'created_transaction',
              create_date: Date.now(),
            });
            userCreateTransaction.save();
          })
          .catch((err) => {
            res.json({
              result: 'failed',
              data: [],
              message: `error is : ${err}`,
            });
          });

        // console.log(placeLocation);
      } else if (lengthDataExpense === 0) {
        if (lengthDataLocation > 0) {
          if (lengthDataImage > 0) {
            let imageURL =
              files.image.length > 1
                ? files.image.map((item) => item.path.split(type).pop())
                : [files.image.path.split(type).pop()];
            let placeLocation = new PlaceLocation({
              trip_id: trip_id,
              author: dataLocation.author,
              imageURL: imageURL,
              address: dataLocation.address,
              latitude: dataLocation.latitude,
              longitude: dataLocation.longitude,
            });
            await placeLocation.save();
            let imageTrip = new ImageTrip({
              trip_id: dataExpense.trip_id,
              imageURL: imageURL,
            });
            await imageTrip.save();
            let idForShare = {
              imgId: imageTrip._id,
              locationId: placeLocation._id,
            };
            res.json({
              result: 'ok',
              idForShare,
            });
          } else {
            let placeLocation = new PlaceLocation({
              trip_id: trip_id,
              author: dataLocation.author,
              address: dataLocation.address,
              latitude: dataLocation.latitude,
              longitude: dataLocation.longitude,
            });
            await placeLocation.save();
            let idForShare = {
              imgId: '',
              locationId: placeLocation._id,
            };
            res.json({
              result: 'ok',
              idForShare,
            });
          }
        } else {
          let imageURL =
            files.image.length > 1
              ? files.image.map((item) => item.path.split(type).pop())
              : [files.image.path.split(type).pop()];
          console.log(imageURL);
          let imageTrip = new ImageTrip({
            trip_id: trip_id,
            imageURL: imageURL,
          });
          await imageTrip.save();
          let idForShare = {
            imgId: imageTrip._id,
            locationId: '',
          };
          res.json({
            result: 'ok',
            idForShare,
          });
        }
      } else if (lengthDataLocation === 0) {
        if (lengthDataExpense > 0) {
          if (lengthDataImage > 0) {
            let imageURL =
              files.image.length > 1
                ? files.image.map((item) => item.path.split(type).pop())
                : [files.image.path.split(type).pop()];
            let imageTrip = new ImageTrip({
              trip_id: dataExpense.trip_id,
              imageURL: imageURL,
            });
            await imageTrip.save();
            let idForShare = {
              imgId: imageTrip._id,
              locationId: '',
            };
            let transaction = new Transaction({
              name: dataExpense.name,
              author: dataExpense.author,
              amount: dataExpense.amount,
              trip_id: trip_id,
              list_user: dataExpense.list_user,
              avatar: randomIntFromInterval(6, 9),
              imageURL: imageURL,
            });
            transaction
              .save()
              .then((transaction) => {
                res.json({
                  result: 'ok',
                  data: transaction,
                  idForShare,
                  message: 'save transaction successfully',
                });
                let list_user = dataExpense.list_user;
                console.log(list_user);
                for (let i = 0; i < list_user.length; i++) {
                  if (list_user[i].type === -1) {
                    let transactionUser = new TransactionUser({
                      user_id: list_user[i].user_id,
                      transaction_id: transaction._id,
                      trip_id: trip_id,
                      amount_user: list_user[i].amount_user,
                      type: list_user[i].type,
                      total: list_user[i].amount_user * list_user[i].type,
                    });
                    transactionUser.save();
                  } else {
                    console.log('Type 1');
                  }
                }
                for (let i = 0; i < list_user.length; i++) {
                  if (list_user[i].type !== -1) {
                    let transactionUser = new TransactionUser({
                      user_id: list_user[i].user_id,
                      transaction_id: transaction._id,
                      trip_id: trip_id,
                      amount_user: list_user[i].amount_user,
                      type: list_user[i].type,
                      total: list_user[i].type - list_user[i].amount_user,
                    });
                    transactionUser.save();
                  } else {
                    console.log(`type -1`);
                  }
                }
                let userCreateTransaction = new UserActivity({
                  user_id: dataExpense.author,
                  transaction_id: transaction._id,
                  trip_id: trip_id,
                  type: 'created_transaction',
                  create_date: Date.now(),
                });
                userCreateTransaction.save();
              })
              .catch((err) => {
                res.json({
                  result: 'failed',
                  data: [],
                  message: `error is : ${err}`,
                });
              });
          } else {
            let transaction = new Transaction({
              name: dataExpense.name,
              author: dataExpense.author,
              amount: dataExpense.amount,
              trip_id: trip_id,
              list_user: dataExpense.list_user,
              avatar: randomIntFromInterval(6, 9),
            });
            transaction
              .save()
              .then((transaction) => {
                res.json({
                  result: 'ok',
                  data: transaction,
                  message: 'save transaction successfully',
                });
                let list_user = dataExpense.list_user;
                console.log(list_user);
                for (let i = 0; i < list_user.length; i++) {
                  if (list_user[i].type === -1) {
                    let transactionUser = new TransactionUser({
                      user_id: list_user[i].user_id,
                      transaction_id: transaction._id,
                      trip_id: trip_id,
                      amount_user: list_user[i].amount_user,
                      type: list_user[i].type,
                      total: list_user[i].amount_user * list_user[i].type,
                    });
                    transactionUser.save();
                  } else {
                    console.log('Type 1');
                  }
                }
                for (let i = 0; i < list_user.length; i++) {
                  if (list_user[i].type !== -1) {
                    let transactionUser = new TransactionUser({
                      user_id: list_user[i].user_id,
                      transaction_id: transaction._id,
                      trip_id: trip_id,
                      amount_user: list_user[i].amount_user,
                      type: list_user[i].type,
                      total: list_user[i].type - list_user[i].amount_user,
                    });
                    transactionUser.save();
                  } else {
                    console.log(`type -1`);
                  }
                }
                let userCreateTransaction = new UserActivity({
                  user_id: dataExpense.author,
                  transaction_id: transaction._id,
                  trip_id: trip_id,
                  type: 'created_transaction',
                  create_date: Date.now(),
                });
                userCreateTransaction.save();
              })
              .catch((err) => {
                res.json({
                  result: 'failed',
                  data: [],
                  message: `error is : ${err}`,
                });
              });
          }
        } else {
          let imageURL =
            files.image.length > 1
              ? files.image.map((item) => item.path.split(type).pop())
              : [files.image.path.split(type).pop()];
          let imageTrip = new ImageTrip({
            trip_id: trip_id,
            imageURL: imageURL,
          });
          await imageTrip.save();
          let idForShare = {
            imgId: imageTrip._id,
            locationId: '',
          };
          res.json({
            result: 'ok',
            idForShare,
          });
        }
      } else if (lengthDataImage === 0) {
        if (lengthDataExpense > 0) {
          if (lengthDataLocation > 0) {
            let placeLocation = new PlaceLocation({
              trip_id: trip_id,
              author: dataLocation.author,
              nameTransaction: dataExpense.name,
              amountTransaction: dataExpense.amount,
              address: dataLocation.address,
              latitude: dataLocation.latitude,
              longitude: dataLocation.longitude,
            });
            placeLocation.save();
            let transaction = new Transaction({
              name: dataExpense.name,
              author: dataExpense.author,
              amount: dataExpense.amount,
              trip_id: trip_id,
              list_user: dataExpense.list_user,
              address: dataLocation.address,
              avatar: randomIntFromInterval(6, 9),
            });
            transaction
              .save()
              .then((transaction) => {
                res.json({
                  result: 'ok',
                  data: transaction,
                  message: 'save transaction successfully',
                });
                let list_user = dataExpense.list_user;
                console.log(list_user);
                for (let i = 0; i < list_user.length; i++) {
                  if (list_user[i].type === -1) {
                    let transactionUser = new TransactionUser({
                      user_id: list_user[i].user_id,
                      transaction_id: transaction._id,
                      trip_id: trip_id,
                      amount_user: list_user[i].amount_user,
                      type: list_user[i].type,
                      total: list_user[i].amount_user * list_user[i].type,
                    });
                    transactionUser.save();
                  } else {
                    console.log('Type 1');
                  }
                }
                for (let i = 0; i < list_user.length; i++) {
                  if (list_user[i].type !== -1) {
                    let transactionUser = new TransactionUser({
                      user_id: list_user[i].user_id,
                      transaction_id: transaction._id,
                      trip_id: trip_id,
                      amount_user: list_user[i].amount_user,
                      type: list_user[i].type,
                      total: list_user[i].type - list_user[i].amount_user,
                    });
                    transactionUser.save();
                  } else {
                    console.log(`type -1`);
                  }
                }
                let userCreateTransaction = new UserActivity({
                  user_id: dataExpense.author,
                  transaction_id: transaction._id,
                  trip_id: trip_id,
                  type: 'created_transaction',
                  create_date: Date.now(),
                });
                userCreateTransaction.save();
              })
              .catch((err) => {
                res.json({
                  result: 'failed',
                  data: [],
                  message: `error is : ${err}`,
                });
              });
          } else {
            let transaction = new Transaction({
              name: dataExpense.name,
              author: dataExpense.author,
              amount: dataExpense.amount,
              trip_id: trip_id,
              list_user: dataExpense.list_user,
              avatar: randomIntFromInterval(6, 9),
            });
            transaction
              .save()
              .then((transaction) => {
                res.json({
                  result: 'ok',
                  data: transaction,
                  message: 'save transaction successfully',
                });
                let list_user = dataExpense.list_user;
                console.log(list_user);
                for (let i = 0; i < list_user.length; i++) {
                  if (list_user[i].type === -1) {
                    let transactionUser = new TransactionUser({
                      user_id: list_user[i].user_id,
                      transaction_id: transaction._id,
                      trip_id: trip_id,
                      amount_user: list_user[i].amount_user,
                      type: list_user[i].type,
                      total: list_user[i].amount_user * list_user[i].type,
                    });
                    transactionUser.save();
                  } else {
                    console.log('Type 1');
                  }
                }
                for (let i = 0; i < list_user.length; i++) {
                  if (list_user[i].type !== -1) {
                    let transactionUser = new TransactionUser({
                      user_id: list_user[i].user_id,
                      transaction_id: transaction._id,
                      trip_id: trip_id,
                      amount_user: list_user[i].amount_user,
                      type: list_user[i].type,
                      total: list_user[i].type - list_user[i].amount_user,
                    });
                    transactionUser.save();
                  } else {
                    console.log(`type -1`);
                  }
                }
                let userCreateTransaction = new UserActivity({
                  user_id: dataExpense.author,
                  transaction_id: transaction._id,
                  trip_id: trip_id,
                  type: 'created_transaction',
                  create_date: Date.now(),
                });
                userCreateTransaction.save();
              })
              .catch((err) => {
                res.json({
                  result: 'failed',
                  data: [],
                  message: `error is : ${err}`,
                });
              });
          }
        } else {
          let placeLocation = new PlaceLocation({
            trip_id: trip_id,
            author: dataLocation.author,
            address: dataLocation.address,
            latitude: dataLocation.latitude,
            longitude: dataLocation.longitude,
          });
          placeLocation.save();
          res.json({
            result: 'ok',
          });
        }
      }
    });
  },
  getImage: async (req, res, next) => {
    let imageName = 'uploads/' + req.query.image_name;
    fs.readFile(imageName, (err, imageData) => {
      if (err) {
        res.json({
          result: 'failed',
          message: `Cannot read image.Error is : ${err}`,
        });
      }
      res.writeHead(200, { 'Content-Type': 'image/jpeg' });
      res.end(imageData);
    });
  },
  updateTransaction: async (req, res, next) => {
    const { list_user } = req.body;
    let update_date = Date.now();
    let transaction = await Transaction.findOneAndUpdate(
      {
        $and: [
          {
            trip_id: mongoose.Types.ObjectId(req.body.trip_id),
          },
          {
            _id: mongoose.Types.ObjectId(req.body.transaction_id),
          },
        ],
      },
      {
        $set: {
          update_date: update_date,
          name: req.body.name,
          amount: req.body.amount,
        },
      },
      {
        options: {
          new: true,
          multi: true,
        },
      },
    );

    let userUpdateTransaction = new UserActivity({
      user_id: req.body.user_id,
      transaction_id: req.body.transaction_id,
      trip_id: req.body.trip_id,
      type: 'updated',
      update_date: Date.now(),
    });
    await userUpdateTransaction.save();
    await res.json(transaction);
    let transactionsUser = await TransactionUser.find({
      $and: [
        {
          trip_id: mongoose.Types.ObjectId(req.body.trip_id),
        },
        {
          transaction_id: mongoose.Types.ObjectId(req.body.transaction_id),
        },
      ],
    });
    if (list_user.length === transactionsUser.length) {
      for (let i = 0; i < list_user.length; i++) {
        let a = await TransactionUser.findOneAndUpdate(
          {
            $and: [
              {
                user_id: mongoose.Types.ObjectId(list_user[i].user_id),
              },
              {
                transaction_id: mongoose.Types.ObjectId(req.body.transaction_id),
              },
              {
                trip_id: mongoose.Types.ObjectId(req.body.trip_id),
              },
            ],
          },
          {
            $set: {
              update_date: update_date,
              amount_user: list_user[i].amount_user,
              type: list_user[i].type,
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
      let listsTransaction = await TransactionUser.find({
        $and: [
          {
            trip_id: mongoose.Types.ObjectId(req.body.trip_id),
          },
          {
            transaction_id: mongoose.Types.ObjectId(req.body.transaction_id),
          },
        ],
      });
      for (let i = 0; i < listsTransaction.length; i++) {
        let userTransaction = await TransactionUser.findOne({
          $and: [
            {
              user_id: mongoose.Types.ObjectId(listsTransaction[i].user_id),
            },
            {
              transaction_id: mongoose.Types.ObjectId(req.body.transaction_id),
            },
            {
              trip_id: mongoose.Types.ObjectId(req.body.trip_id),
            },
          ],
        });
        if (userTransaction.type === -1) {
          userTransaction.total = userTransaction.amount_user * userTransaction.type;
        } else {
          userTransaction.total = userTransaction.type - userTransaction.amount_user;
        }
        userTransaction.save();
      }
    } else {
      let transactionsDelete = [];
      let strTransaction = [];
      let list_users = [];
      for (let i in transactionsUser) {
        let str = JSON.stringify(transactionsUser[i].user_id);
        let a = str.replace(/^"|"$/g, '');
        strTransaction.push(a);
      }
      for (let i = 0; i < list_user.length; i++) {
        let a = list_user[i].user_id;
        list_users.push(a);
      }
      strTransaction.forEach((item) => {
        if (
          list_users.some((items) => {
            return item === items;
          })
        ) {
          console.log('equal');
        } else {
          transactionsDelete.push(item);
        }
      });
      for (let i = 0; i < transactionsDelete.length; i++) {
        let a = await TransactionUser.findOneAndRemove({
          $and: [
            {
              user_id: mongoose.Types.ObjectId(transactionsDelete[i]),
            },
            {
              transaction_id: mongoose.Types.ObjectId(req.body.transaction_id),
            },
            {
              trip_id: mongoose.Types.ObjectId(req.body.trip_id),
            },
          ],
        });
      }

      for (let i = 0; i < list_user.length; i++) {
        let a = await TransactionUser.findOneAndUpdate(
          {
            $and: [
              {
                user_id: mongoose.Types.ObjectId(list_user[i].user_id),
              },
              {
                transaction_id: mongoose.Types.ObjectId(req.body.transaction_id),
              },
              {
                trip_id: mongoose.Types.ObjectId(req.body.trip_id),
              },
            ],
          },
          {
            $set: {
              update_date: update_date,
              amount_user: list_user[i].amount_user,
              type: list_user[i].type,
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
      let listsTransaction = await TransactionUser.find({
        $and: [
          {
            trip_id: mongoose.Types.ObjectId(req.body.trip_id),
          },
          {
            transaction_id: mongoose.Types.ObjectId(req.body.transaction_id),
          },
        ],
      });
      for (let i = 0; i < listsTransaction.length; i++) {
        let userTransaction = await TransactionUser.findOne({
          $and: [
            {
              user_id: mongoose.Types.ObjectId(listsTransaction[i].user_id),
            },
            {
              transaction_id: mongoose.Types.ObjectId(req.body.transaction_id),
            },
            {
              trip_id: mongoose.Types.ObjectId(req.body.trip_id),
            },
          ],
        });
        if (userTransaction.type === -1) {
          userTransaction.total = userTransaction.amount_user * userTransaction.type;
        } else {
          userTransaction.total = userTransaction.type - userTransaction.amount_user;
        }
        userTransaction.save();
      }
    }
  },

  deleteTransaction: async (req, res, next) => {
    // Transaction.findOneAndRemove(
    //     {
    //         $and: [
    //             {
    //                 trip_id: mongoose.Types.ObjectId(req.body.trip_id)
    //             },
    //             {
    //                 _id: mongoose.Types.ObjectId(req.body.transaction_id)
    //             }
    //         ]
    //     }
    // ).then(item => {
    //     res.json({
    //         result: "ok",
    //         data: item,
    //         message: "Query list of transaction successfully"
    //     })
    // })
    //     .catch(err => {
    //         res.json({
    //             result: "failed",
    //             data: [],
    //             message: `error is : ${err}`
    //         })
    //     });

    let transaction = await Transaction.findOneAndUpdate(
      {
        $and: [
          {
            trip_id: mongoose.Types.ObjectId(req.body.trip_id),
          },
          {
            _id: mongoose.Types.ObjectId(req.body.transaction_id),
          },
        ],
      },
      {
        $set: {
          isDelete: true,
          delete_date: Date.now(),
        },
      },
      {
        options: {
          new: true,
          multi: true,
        },
      },
    );
    await res.json(transaction);

    let a = await TransactionUser.deleteMany({
      $and: [
        {
          trip_id: mongoose.Types.ObjectId(req.body.trip_id),
        },
        {
          transaction_id: mongoose.Types.ObjectId(req.body.transaction_id),
        },
      ],
    });
    console.log(a);
    let userDeleteTransaction = new UserActivity({
      user_id: req.body.user_id,
      transaction_id: req.body.transaction_id,
      trip_id: req.body.trip_id,
      type: 'deleted_transaction',
      delete_date: Date.now(),
    });
    userDeleteTransaction.save();
  },
};
