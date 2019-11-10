var mongoose = require('mongoose')

var schema = mongoose.Schema

var exchangeSchema = new schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    currency: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'currency'
    },
    date : {
        type: Date,
        default: Date.now,
    },
    rate : {
        type: Number,
        required: true
    }
  },
  {
    collection: 'exchanges'
  }
)

var exchange = mongoose.model('exchange', exchangeSchema);

module.exports = exchange