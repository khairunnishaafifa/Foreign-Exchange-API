var express = require('express')
    , router = express.Router()

var currencyCtrl = require('../controllers/v1/currencyController')

router.route('/')
    .post(currencyCtrl.addCurrency)
    .get(currencyCtrl.getDetailRate)

router.route('/date')
    .get(currencyCtrl.getCcyByDate)

router.route('/:id')
    .put(currencyCtrl.updateCcy)
    .delete(currencyCtrl.deleteCcy)

module.exports = router