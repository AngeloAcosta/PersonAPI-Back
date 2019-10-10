'use strict';

const express = require('express');
const syncDatabase = require('./../../../models/setup')

const router = express.Router();

router.get('/database', async (request, response) => {
    try {
        await syncDatabase();
        response.status(200).send('Database synced!');
    } catch (err) {
        response.status(500).send(`Error syncing database: ${err}`);
    }
});

module.exports = router;