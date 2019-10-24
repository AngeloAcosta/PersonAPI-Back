'use strict';

const express = require('express');
const kinshipsController = require('./kinships.controller');

const router = express.Router();

router.get('/', kinshipsController.get);
router.get('/types', kinshipsController.getTypes);

module.exports = router;
