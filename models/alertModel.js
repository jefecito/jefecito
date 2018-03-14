/**
 * Requires
 */
const mongoose = require('mongoose')

/**
 * Declare schema
 */
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
}, {
  collection: 'Alert'
})

module.exports = mongoose.model('Alert', alertsSchema)