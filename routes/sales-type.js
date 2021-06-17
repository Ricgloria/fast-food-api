const express = require('express');
const router = express.Router();
const masterAuth = require('../middleware/master-auth');

const salesTypeController = require('../controllers/sales-type-controller');

router.get('/', masterAuth, salesTypeController.getSaleTypes);

router.get('/sales', salesTypeController.getSaleTypesForSales);

router.get('/:id', masterAuth, salesTypeController.getSaleTypesById);

router.patch('/', masterAuth, salesTypeController.patchSaleType);

module.exports = router;
