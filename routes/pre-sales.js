const express = require('express');
const router = express.Router();
const masterAuth = require('../middleware/master-auth');

const preSalesController = require('../controllers/pre-sales-controller');

router.get('/', masterAuth, preSalesController.getAllPreSales);

router.get('/:id', masterAuth, preSalesController.getPreSaleById);

router.get('/active/:id', preSalesController.getActivePreSaleById);

router.post('/', preSalesController.postPreSale);

router.patch('/', preSalesController.patchPreSales);

module.exports = router;
