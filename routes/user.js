const express = require('express');
const router = express.Router();
const masterAuth = require('../middleware/master-auth');

const userController = require('../controllers/user-controller');

router.get('/', masterAuth, userController.getUsers);

router.get('/:id', masterAuth, userController.getUsersById);

router.post('/', masterAuth, userController.postUser);

router.post('/login', userController.userLogin);

router.put('/:id', masterAuth, userController.putUser);

router.delete('/:id', masterAuth, userController.deleteUser);

module.exports = router;
