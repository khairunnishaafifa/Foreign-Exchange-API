var currency = require('../models/v1/currency')
    , exchange = require('../models/v1/exhange')

exports.last7Days = (date) => {
    var result = []

    for (var i = 0; i < 7; i++) {
        var d = new Date(date)
        d.setDate(d.getDate() - i)
        result.push(d)
    }

    return (result)
}

exports.listAvgByDate = async (ccy, exc, date) => {

    var result = []

    for (var i = 0; i < ccy.length; i++) {

        if (ccy[i].listExchange.length === 0) {
            var values = {
                from: ccy[i].fromCcy,
                to: ccy[i].toCcy,
                rate: 'Insufficient data'
            }

            result.push(values)
        }
    }

    for (var j = 0; j < exc.length; j++) {

        let avg = exc[j].avg
        let id = exc[j]._id

        await currency
            .findOne({ _id: id })
            .exec()
            .then(async res => {

                await exchange
                    .findOne({ currency: id, date: date })
                    .select('rate')
                    .exec()
                    .then(exchange => {

                        var values = {
                            from: res.fromCcy,
                            to: res.toCcy,
                            rate: exchange.rate,
                            average: avg.toFixed(6)
                        }

                        result.push(values)

                    })
            })
    }

    return result
}