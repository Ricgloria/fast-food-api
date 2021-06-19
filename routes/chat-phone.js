const express = require('express');
const router = express.Router();
const masterAuth = require('../middleware/master-auth');

const chatPhoneController = require('../controllers/chat-phone-controller');

router.get('/', chatPhoneController.getChatPhone);

router.patch('/', masterAuth, chatPhoneController.patchChatPhone);

module.exports = router;
