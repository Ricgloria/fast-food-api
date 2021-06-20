const express = require('express');
const router = express.Router();
const userToken = require('../middleware/user-token.js');

const expectedTime = require('../controllers/expected-time-controller');

router.get('/', expectedTime.getExpectedTime);

router.patch('/:id', userToken, expectedTime.patchExpectedTime);

module.exports = router;
