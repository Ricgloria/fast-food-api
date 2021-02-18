const express = require('express');
const router = express.Router();

const paymentMethodController = require('../controllers/payment-method-controller');

router.get('/', paymentMethodController.getPaymentMethod);

router.get('/sales', paymentMethodController.getPaymentMethodForSales);

router.get('/:id', paymentMethodController.getPaymentMethodById);

router.post('/', paymentMethodController.postPaymentMethod);

router.put('/:id', paymentMethodController.putPaymentMethod);

router.delete('/:id', paymentMethodController.deletePaymentMethod);

module.exports = router;
