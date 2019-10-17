'use strict';

const express = require('express');
const router = express.Router();

router.use('/authenticate', require('./authentication'));
router.use('/people', require('./people'));
router.use('/users', require('./users'));
router.use('/kinships',require('./kinships'));

module.exports = router;
