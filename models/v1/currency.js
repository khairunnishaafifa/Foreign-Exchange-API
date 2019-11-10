var mongoose = require('mongoose')

var schema = mongoose.Schema

var currencySchema = new schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    fromCcy: {
      type: String,
      required: true,
      uppercase: true,
      maxlength: 3
    },
    toCcy: {
      type: String,
      required: true,
      uppercase: true,
      maxlength: 3
    },
    listExchange: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'exchange'
    }]
  },
  {
    collection: 'currencies'
  }
)

var currency = mongoose.model('currency', currencySchema);

module.exports = currency