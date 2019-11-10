var express = require('express')
    , router = express.Router()

var exchangeCtrl = require('../controllers/v1/exchangeController')

router.route('/')
    .post(exchangeCtrl.addRate)

router.route('/:id')
    .put(exchangeCtrl.updateExchange)
    .delete(exchangeCtrl.deleteExchange)

module.exports = router