const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;

const productController = require('../controllers/product-controller');

router.get('/', productController.getProducts);

router.get('/sales', productController.getProductsForSales);

router.get('/:id', productController.getProductById);

router.post('/', productController.postProduct);

router.put('/:id', productController.putProduct);

router.delete('/:id', productController.deleteProduct);

module.exports = router;
