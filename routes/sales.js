const express = require('express');
const router = express.Router();
const userToken = require('../middleware/user-token.js');

const salesController = require('../controllers/sales-controller');

router.get('/', userToken, salesController.getAllSales);

router.post('/', userToken, salesController.postSale);

module.exports = router;
