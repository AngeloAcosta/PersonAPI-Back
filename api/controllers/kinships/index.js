'use strict';

const express = require('express');
const kinshipController = require('./kinship.controller');
const kinshipsController = require('./kinships.controller');

const router = express.Router();

router.get('/', kinshipsController.get);
router.get('/:id', kinshipController.get);
router.post('/', kinshipController.post);
//router.put('/:id', kinshipController.update);
//router.delete('/:id', kinshipController.remove);


module.exports = router;
