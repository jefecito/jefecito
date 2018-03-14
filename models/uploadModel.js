/**
 * Requires
 */
const mongoose = require('mongoose')

/**
 * Declare schema
 */
const uploadSchema = mongoose.Schema({
  uploadedAt: Date,
  uploadedBy: {
    id: String,
    username: String
  },
  uploadName: String,
  uploadSize: Number,
  uploadPath: String,
  uploadAlias: String,
  uploadHash: String,
  uploadTo: {
    global: {
      type: Boolean,
      default: false,
      required: true
    },
    users: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    folder: {
      type: String,
      default: 'default'
    }
  },
  downloadCounter: {
    type: Number,
    default: 0
  }
}, {
  collection: 'Upload'
})

module.exports = mongoose.model('Upload', uploadSchema)