const express = require('express');
const router = express.Router();

const userController = require('../controllers/user-controller');

router.get('/', userController.getUsers);

router.get('/:id', userController.getUsersById);

router.post('/', userController.postUser);

router.post('/login', userController.userLogin);

router.put('/:id', userController.putUser);

router.delete('/:id', userController.deleteUser);

module.exports = router;
