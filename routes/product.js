const express = require('express');
const router = express.Router();
const masterAuth = require('../middleware/master-auth');

const productController = require('../controllers/product-controller');

router.get('/', masterAuth, productController.getProducts);

router.get('/sales', productController.getProductsForSales);

router.get('/:id', masterAuth, productController.getProductById);

router.post('/', masterAuth, productController.postProduct);

router.put('/:id', masterAuth, productController.putProduct);

router.delete('/:id', masterAuth, productController.deleteProduct);

module.exports = router;
