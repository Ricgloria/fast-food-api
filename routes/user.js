const express = require('express');
const router = express.Router();
const masterAuth = require('../middleware/master-auth');
const userToken = require('../middleware/user-token.js');

const userController = require('../controllers/user-controller');

router.get('/', masterAuth, userController.getUsers);

router.get('/:id', masterAuth, userController.getUsersById);

router.post('/', masterAuth, userController.postUser);

router.post('/login', userController.userLogin);

router.put('/:id', masterAuth, userController.putUser);

router.delete('/:id', masterAuth, userController.deleteUser);

router.patch('/:id', masterAuth, userController.resetPassword);

router.patch('/renew', userToken, userController.renewPassword);

module.exports = router;
