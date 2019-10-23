'use strict';

const express = require('express');
const contactTypesController = require('./contact.types.controller');

const router = express.Router();

router.get('/', contactTypesController.get);

module.exports = router;
