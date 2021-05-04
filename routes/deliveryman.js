const express = require('express');
const router = express.Router();
const masterAuth = require('../middleware/master-auth');

const deliverymanController = require('../controllers/deliveryman-controller')

router.get('/', masterAuth, deliverymanController.getDeliveryman);

router.get('/sales', deliverymanController.getDeliverymanForSales);

router.get('/:id', masterAuth, deliverymanController.getDeliverymanById);

router.post('/', masterAuth, deliverymanController.postDeliveryman);

router.put('/:id', masterAuth, deliverymanController.putDeliveryman);

router.delete('/:id', masterAuth, deliverymanController.deleteDeliveryman);

module.exports = router;
