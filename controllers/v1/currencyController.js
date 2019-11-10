var mongoose = require('mongoose')

var currency = require('../../models/v1/currency')
    , exchange = require('../../models/v1/exhange')
    , operation = require('../../services/operation')
    , { successResponse, errorResponse } = require('../../helpers/response')

exports.addCurrency = async (req, res) => {

    var fromCcy = req.body.fromCcy
        , toCcy = req.body.toCcy

    var ccyExist = await currency.findOne({
        fromCcy, toCcy
    })

    if (ccyExist) {
        return res.status(409).json(
            errorResponse('Currency already exist')
        )
    }

    var newCurrency = new currency({
        _id: new mongoose.Types.ObjectId(),
        fromCcy, toCcy,
        listExchange: []
    })

    newCurrency.save()
        .then(() => {
            return res.status(201).json(
                successResponse('Currency successfully saved', newCurrency)
            )
        })
        .catch(err => {
            return res.status(422).json(
                errorResponse('Request is not quite right', err.message, 422)
            )
        })
}

exports.getCcyByDate = async (req, res) => {

    var date = req.body.date
    var sevenDays = operation.last7Days(date)

    var rateExist = await exchange.findOne({
        date: date
    })

    if (!rateExist) {
        return res.status(404).json(
            errorResponse('Rate not found')
        )
    }

    currency.find()
        .select('-__v')
        .sort({ created: -1 })
        .populate({
            path: 'listExchange',
            match: { date: { $gte: sevenDays[6], $lte: sevenDays[0] } },
            select: '-_id -currency -__v',
        })
        .exec()
        .then(currency => {

            exchange.aggregate([
                { $match: { date: { $gte: sevenDays[6], $lte: sevenDays[0] } } },
                {
                    $group: {
                        _id: '$currency',
                        avg: { $avg: '$rate' }
                    }
                }
            ]).then(exchange => {

                operation.listAvgByDate(currency, exchange, date, res)
                    .then(result => {
                        return res.status(200).json(
                            successResponse('Rate found', result)
                        )
                    })
            })
        })
}

exports.getDetailRate = async (req, res) => {

    var fromCcy = req.body.fromCcy
        , toCcy = req.body.toCcy

    var currencyExist = await currency.findOne({
        fromCcy, toCcy
    })

    if (!currencyExist) {
        return res.status(404).json(
            errorResponse('Currency not found')
        )
    }

    var ccyId = currencyExist._id

    var getExchange = await exchange.aggregate([
        { $match: { currency: ccyId } },
        { $sort: { date: -1 } },
        { $limit: 7 },
        {
            $group: {
                _id: { currency: ccyId },
                avg: { $avg: '$rate' },
                max: { $max: '$rate' },
                min: { $min: '$rate' }
            }
        }
    ]).exec()

    var average = getExchange[0].avg
    var variance = (getExchange[0].max - getExchange[0].min)

    var detail = await exchange.find({
        currency: ccyId
    })
        .select('-_id -currency -__v')
        .sort({ date: -1 })
        .limit(7)
        .exec()

    var result = {
        fromCcy, toCcy, average, variance, detail
    }

    res.status(200).json(
        successResponse('Result', result)
    )
}

exports.deleteCcy = (req, res) => {

    exchange.deleteMany({
        currency: req.params.id
    }).exec()

    currency.deleteOne({
        _id: req.params.id
    })
        .exec()
        .then(() => {
            return res.status(200).json(
                successResponse('Currency deleted successfully')
            )
        })
}

exports.updateCcy = async (req, res) => {

    currency.findOneAndUpdate(
        { _id: req.params.id },
        { $set: req.body },
        { 'new': true, runValidators: true, context: 'query' })
        .exec()
        .then(result => {
            return res.status(200).json(
                successResponse('Currency updated successfully', result)
            )
        })
        .catch(err => {
            return res.status(422).json(
                errorResponse('Request is not quite right', err.message, 422)
            )
        })
}