const express = require('express');
const router = express.Router();
const userToken = require('../middleware/user-token.js');
const masterAuth = require('../middleware/master-auth');

const salesController = require('../controllers/sales-controller');

router.get('/', masterAuth, salesController.getAllSales);

router.post('/', userToken, salesController.postSale);

module.exports = router;
