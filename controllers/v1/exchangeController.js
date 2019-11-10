var mongoose = require('mongoose')

var exchange = require('../../models/v1/exhange')
    , currency = require('../../models/v1/currency')
    , { successResponse, errorResponse } = require('../../helpers/response')

exports.addRate = async (req, res) => {

    var date = req.body.date
        , rate = req.body.rate
        , fromCcy = req.body.fromCcy
        , toCcy = req.body.toCcy

    var ccyExist = await currency.findOne({
        fromCcy, toCcy
    })

    if (!ccyExist) {
        return res.status(404).json(
            errorResponse('Currency not found, add new one')
        )
    }

    var newRate = new exchange({
        _id: new mongoose.Types.ObjectId(),
        currency: ccyExist._id,
        date, rate
    })

    newRate.save(function (err) {
        if (err) {
            return res.status(422).json(
                errorResponse('Request is not quite right', err.message, 422)
            )
        }

        currency.updateOne(
            { _id: ccyExist._id },
            { $push: { listExchange: newRate._id } }
        ).exec()
            .then(() => {
                return res.status(201).json(
                    successResponse('Rate successfully saved', newRate)
                )
            })
    })
}

exports.deleteExchange = (req, res) => {

    exchange.deleteOne({
        _id: req.params.id
    })
        .exec()
        .then(result => {

            currency.updateOne(
                { _id: result.currency },
                { $pull: { listExchange: req.params.id } }
            )
                .exec()
                .then(() => {
                    return res.status(200).json(
                        successResponse('Exchange deleted successfully')
                    )
                })  
        })
}

exports.updateExchange = async (req, res) => {

    exchange.findOneAndUpdate(
        { _id: req.params.id },
        { $set: req.body },
        { 'new': true, runValidators: true, context: 'query' })
        .exec()
        .then(result => {
            return res.status(200).json(
                successResponse('Exchange updated successfully', result)
            )
        })
        .catch(err => {
            return res.status(422).json(
                errorResponse('Request is not quite right', err.message, 422)
            )
        })
}