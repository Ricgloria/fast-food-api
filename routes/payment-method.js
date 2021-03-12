const express = require('express');
const router = express.Router();
const masterAuth = require('../middleware/master-auth');

const paymentMethodController = require('../controllers/payment-method-controller');

router.get('/', masterAuth, paymentMethodController.getPaymentMethod);

router.get('/sales', paymentMethodController.getPaymentMethodForSales);

router.get('/:id', masterAuth, paymentMethodController.getPaymentMethodById);

router.post('/', masterAuth, paymentMethodController.postPaymentMethod);

router.put('/:id', masterAuth, paymentMethodController.putPaymentMethod);

router.delete('/:id', masterAuth, paymentMethodController.deletePaymentMethod);

module.exports = router;
