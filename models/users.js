// require
const mongoose = require('mongoose')
const bcrypt = require('bcrypt-nodejs')

// models
const Upload = mongoose.model('Upload')
const Alert = mongoose.model('Alert')

// declare schema
const userSchema = mongoose.Schema({
  local: {
    createdAt: {
      type: Date,
      required: 'createdAt must be filled'
    },
    username: String,
    email: {
      type: String,
      unique: 'Users email must be unique'
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
});

// schema methods ======================
// generating a hash
userSchema.methods.generateHash = password => {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = password => {
  return bcrypt.compareSync(password, this.local.password);
};

module.exports = mongoose.model('User', userSchema);