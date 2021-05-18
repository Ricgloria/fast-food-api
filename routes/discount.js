const express = require('express');
const router = express.Router();
const masterAuth = require('../middleware/master-auth');

const discountController = require('../controllers/discount-contoller');

router.get('/', masterAuth, discountController.getDiscount);
router.put('/', masterAuth, discountController.putDiscount);

module.exports = router;
