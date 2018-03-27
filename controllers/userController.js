/* jshint esversion: 6 */

/**
 * Requires
 */
const mongoose = require('mongoose')
const User = mongoose.model('User')
const validator = require('validator')

/**
 * Trae todos los usuarios o específico según ID
 */
exports.getAllUsers = (req, res, next) => {
  const Q = req.query
  let FILTER = {}

  if (Q.id) {
    FILTER._id = Q.id
  }

  User
    .find(FILTER, (err, users) => {
      if (err) {
        return res.failure(-1, err, 200)
      } else {
        return res.success(users, 200)
      }
    }) // User.find()
}

/**
 * El administrador crea un usuario
 */
exports.createUser = (req, res, next) => {
  const B = req.body
  const username = validator.escape(B.username) || ''

  if (validator.isEmail(B.email) && B.password.length > 7) {
    return res.failure(-1, 'Parámetros insuficientes o incorrectos', 200)
  }

  const FILTER = {
    'local.email': B.email
  }

  User.findOne(FILTER, (err, user) => {
    if (err) {
      return res.failure(-1, err, 200)
    } else if (!user) {
      let newUser = new User({
        local: {
          createdAt: Date.now(),
          username: username,
          email: B.email,
          roles: ['user'],
          creationMethod: 'local',
          isConfirmed: true // set to false when email send added
        }
      })

      newUser.local.password = newUser.generateHash(B.password)      

      newUser.save((err, user) => {
        if (err) {
          return res.failure(-1, err, 200)
        } else {
          // Agregar envio de email
          return res.success('Usuario registrado', 200)
        }
      })
    } else {
      return res.failure(-1, 'Ese correo existe, pruebe crearlo con otro', 200)
    }
  })
}

/**
 * Elimina un usuario específico según ID
 */
exports.removeUser = (req, res, next) => {
  const B = req.body

  if (B.id === undefined) {
    return res.failure(-1, 'Parámetros Insuficientes', 200)
  }

  const FILTER = {
    _id: B.id
  }

  const EXTRA = {
    safe: true,
    new: false
  }

  User
    .findOneAndRemove(FILTER, EXTRA, (err, userRemoved) => {
      if (err) {
        return res.failure(-1, err, 200)
      } else {
        return res.success(userRemoved, 200)
      }
    })
}

/**
 * Actualiza email y nombre de usuario de un usuario
 */
exports.updateEmailUsername = (req, res, next) => {
  const B = req.body

  if (!B.id) {
    return res.failure(-1, 'Parámetros Insuficientes', 200)
  }

  // Preparo el Filtro
  const FILTER = {
    _id: B.id
  }

  // Valido el email y usuario
  const username = validator.escape(B.username);
  const email = validator.escape(B.email);

  // Chequeo que el email sea válido
  const isValidEmail = validator.isEmail(email)

  /**
   * Chequear que sea el mismo usuario (session|token)
   * 
   * if(req.user._id !== B.id) {
   *   return res.failure(-1, 'Solo puede actualizar su usuario', 200)
   * }
   */

  if (!isValidEmail) {
    return res.failure(-1, 'El correo electrónico ingresado no es válido', 200)
  } else {
    const UPDATE = {
      $set: {
        'local.username': username,
        'local.email': email
      }
    }

    const EXTRA = {
      new: true,
      safe: true
    }

    User
      .findOneAndUpdate(FILTER, UPDATE, EXTRA, (err, userUpdated) => {
        if (err) {
          return res.failure(-1, err, 200)
        } else {
          /**
           * Ver que hacer con la sessión
           * 
           * req.user.local.username = username;
           * req.user.local.email    = email;
           * req.session.save((err) => {
           *   return (err) ?
           *     res.failure(-1, err, 200) :
           *     res.success(saved, 200);
           *   }); // req.session.save()
           */
          return res.success(userUpdated, 200)
        } // if/else
      })
  } // if/else
}