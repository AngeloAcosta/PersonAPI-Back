'use strict';

const express = require('express');
const usersController = require('./users.controller');
const userController = require('./user.controller');

const router = express.Router();

router.get('/', usersController.get);
router.get('/:id', userController.get);
router.post('/', userController.post);
router.put('/:id', userController.update);
router.delete('/:id', userController.remove);
router.post('/:id/change-password', userController.changePassword);
router.post('/users/by-uid', userController.getByUid);

module.exports = router;
