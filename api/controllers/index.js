'use strict';

const express = require('express');
const router = express.Router();

router.use('/authenticate', require('./authentication'));
router.use('/contact_types', require('./contact.types'));
router.use('/countries', require('./countries'));
router.use('/document_types', require('./document.types'));
router.use('/genders', require('./genders'));
router.use('/kinships', require('./kinships'));
router.use('/people', require('./people'));
router.use('/users', require('./users'));

module.exports = router;
