const express = require('express');
const clova = require('../clova');
var router = express.Router();

router.post('/clova', clova);

module.exports = router;