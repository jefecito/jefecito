var mongoose = require('mongoose');

var alertsSchema = mongoose.Schema({
  date:{
    created: Date,
    viewed: Date
  },
  viewed: {
    type: Boolean,
    default: false
  },
  msg: String,
});

module.exports = mongoose.model('Alert', alertsSchema);