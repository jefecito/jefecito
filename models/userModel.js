/* jshint esversion: 6 */

/**
 * Requires
 */
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

/**
 * Declare schema
 */
const UserSchema = new mongoose.Schema({
  local: {
    createdAt: {
      type: Date,
      required: 'createdAt must be filled'
    },
    username: String,
    email: {
      type: String,
      unique: 'Users email must be unique',
      required: 'User email is required'
    },
    password: String,
    jwt: String,
    avatar: {
      type: String,
      default: '/img/default.png'
    },
    roles: [String],
    creationMethod: String,
    country: String,
    isConfirmed: {
      type: Boolean,
      default: false
    },
    resetToken: {
      type: String,
      default: undefined
    },
    resetTokenExpires: {
      type: Date,
      default: undefined
    },
    uploadedDocuments:[{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Upload'
    }],
    alerts:[{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Alert'
    }]
  },
  facebook: {
    id: String,
    token: String,
    email: String,
    name: String,
    avatar: String
  },
  twitter: {
    id: String,
    token: String,
    username: String,
    avatar: String
  },
  google: {
    id: String,
    token: String,
    email: String,
    name: String
  }
}, {
  collection: 'User'
})

/**
 * Schema Methods:
 * Generating a hash
 */
UserSchema.methods.generateHash = function(password) {
  console.log('password: ', password);
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null)
}

/**
 * Checking if password is valid
 */
UserSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.local.password)
}

module.exports = mongoose.model('User', UserSchema)