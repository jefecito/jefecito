/* jshint esversion: 6 */

// Modulos
const mongoose = require('mongoose')

// Declare Schema
const alertsSchema = new mongoose.Schema({
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