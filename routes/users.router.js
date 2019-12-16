const express = require('express');

const router = express.Router();
const userController = require('../controllers/users.controller');

router.get('/get_image/:name',userController.getImage);

router.post('/get_info_user', userController.getInfoUser);

router.post('/check_user_exists', userController.checkUserExists);

router.post('/insert_a_user',userController.createUser);

router.post('/upload_avatar/:userId', userController.uploadAvatar);

router.post('/send_money_all_mail/:tripId',userController.sendMoneyAllMail);

router.post('/remind_payment_user', userController.remindPaymentUser);

router.put('/update_a_user/:userId', userController.updateUser);



module.exports = router;
