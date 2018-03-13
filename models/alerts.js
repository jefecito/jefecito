// require
const mongoose = require('mongoose')

// declare schmea
const alertsSchema = mongoose.Schema({
  date: {
    created: Date,
    viewed: Date
  },
  viewed: {
    type: Boolean,
    default: false
  },
  msg: String,
})

module.exports = mongoose.model('Alert', alertsSchema)