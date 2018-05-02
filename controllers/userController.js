/* jshint esversion: 6 */

/**
 * Requires
 */
const mongoose = require('mongoose')
const validator = require('validator')
const mkdirp = require('mkdirp')
const multer = require('multer')
const randomstring = require("randomstring")
const EmailTemplate = require('email-templates-v2').EmailTemplate
const path = require('path')
const bcrypt = require('bcrypt')

/**
 * Models
 */
const User = mongoose.model('User')

/**
 * APP cfg
 */
const APP = require('../config/app/main')
const transporter = APP.getTransporter()

/**
 * Export Email Templates
 */
const requestPasswordTemplate = new EmailTemplate(
  path.join(
    __dirname,
    '../templates',
    'resetemail'
  )
)

/**
 * Admin APIs:
 * 
 * Trae todos los usuarios o específico según ID
 */
exports.getAllUsers = (req, res, next) => {
  const {
    id
  } = req.query

  let FILTER = {}

  if (!!id) {
    FILTER._id = id
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
  let {
    username,
    email,
    password
  } = req.body

  username = validator.escape(username)

  if (validator.isEmail(email) && password.length > 7) {
    return res.failure(-1, 'Parámetros insuficientes o incorrectos', 200)
  }

  const FILTER = {
    'local.email': email
  }

  User
    .findOne(FILTER, (err, user) => {
      if (err) {
        return res.failure(-1, err, 200)
      } else if (!user) {
        let newUser = new User({
          local: {
            createdAt: Date.now(),
            username: username,
            email: email,
            roles: [
              'user'
            ],
            creationMethod: 'local',
            isConfirmed: true // set to false when email send added
          }
        })

        newUser.local.password = newUser.generateHash(password)

        newUser
          .save((err, user) => {
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
  const {
    id
  } = req.body

  if (!id) {
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
 * Trae todos los administradores
 */
exports.getAllAdmins = (req, res, next) => {
  const FILTER = {
    'local.roles': {
      $in: ['admin']
    }
  }

  User
    .find(FILTER, (err, admins) => {
      if (err) {
        return res.failure(-1, err, 200)
      } else {
        return res.success(admins, 200)
      }
    })
}

/**
 * Agrega o remueve los privilegios de administrador
 * de un usuario específico (id)
 */
exports.toggleAdminPriviliges = (req, res, next) => {
  const {
    id,
    toAdmin
  } = req.body

  if (!id) {
    return res.failure(-1, 'Parámetros Insuficientes', 200)
  } else {
    const role = toAdmin ?
      ['admin'] :
      ['user']

    const FILTER = {
      _id: id
    }

    const UPDATE = {
      $set: {
        'local.roles': role
      }
    }

    const EXTRA = {
      new: true,
      safe: true
    }

    User
      .findOneAndUpdate(FILTER, UPDATE, EXTRAS, (err, userUpdated) => {
        if (err) {
          return res.failure(-1, err, 200)
        } else {
          return res.success(userUpdated, 200)
        }
      })
  }
}

/**
 * User APIs:
 * 
 * Traer información mi usuario
 */
exports.currentUserInfo = (req, res, next) => {
  const B = req.body

  if (!req.user) {
    return res.failure(-1, 'Usuario no identificado', 200)
  }

  User
    .findOne({_id: req.user.id}, (err, user) => {
      if (err) {
        return res.failure(-1, err, 200)
      } else {
        const avatarUrl = (user.local.avatar[0] !== '/') ?
          user.local.avatar :
          `${APP.getENV().url}${user.local.avatar}`;

        const response = {
          id: user._id,
          username: user.local.username,
          email: user.local.email,
          roles: user.local.roles,
          avatar: avatarUrl,
          token: B.token
        }

        return res.success(response, 200)
      }
    }) // User.findById
}

/**
 * Confirmo el Email del usuario
 */
exports.confirmEmail = (req, res, next) => {
  const {
    id
  } = req.query

  if (!id) {
    return res.failure(-1, 'Usuario inválido', 200)
  } else {
    const FILTER = {
      _id: id
    }

    const UPDATE = {
      $set: {
        'local.isConfirmed': true
      }
    }

    const EXTRA = {
      new: true,
      safe: true
    }

    User
      .findOneAndUpdate(FILTER, UPDATE, EXTRA, (err, user) => {
        if (err) {
          return res.failure(-1, err, 200)
        } else {
          const response = {
            email: user.local.email
          }

          return res.success(response, 200)
        } // if/else
      }) // User.findOneAndUpdate()
  } // if/else
}

/**
 * Actualiza el nombre de usuario, e email.
 */
exports.updateCurrentUserInfo = (req, res, next) => {
  if (!req.user) {
    return res.failure(-1, 'Acceso denegado', 200)
  }

  const B = req.body
  const username = validator.escape(B.username) || ''

  if(!validator.isEmail(B.email)) {
    return res.failure(-1, 'Email inválido', 200)
  } else {
    let FILTER = {
      _id: {
        $ne: req.user._id
      },
      $or: [{
        'local.username': username
      }, {
        'local.email': B.email
      }]
    }

    User
      .findOne(FILTER, (err, user) => {
        if (err) {
          return res.failure(-1, err, 200)
        } else if(user && user.local.username === username) {
          return res.failure(-1, 'El nombre de usuario ya esta en uso', 200)
        } else if(user && user.local.email === B.email) {
          return res.failure(-1, 'El correo electrónico ya se encuentra registrado', 200)
        } else {
          FILTER = {
            _id: req.user._id
          }

          UPDATE = {
            $set: {
              'local.username': username,
              'local.email': B.email
            }
          }

          EXTRA = {
            new: true,
            safe: true
          }

          User
            .findOneAndUpdate(FILTER, UPDATE, EXTRA, (err, userUpdated) => {
              if (err) {
                return res.failure(-1, err, 200)
              } else {
                return res.success(userUpdated, 200)
              }
            })
        } // if/else
      }) // User.findOne
  } // if/else
}

/**
 * Actualiza el avatar
 */
exports.changeAvatar = (req, res, next) => {
  const USER = req.user
  const imageName = `avatar_${Date.now()}`

  mkdirp(`public/uploads/${USER.id}/avatar/`, err => {
    const storageConfig = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, `public/uploads/${USER.id}/avatar/`)
      },
      filename: (req, file, cb) => {
        cb(null, imageName)
      }
    })

    const multerConfig = {
      storage: storageConfig,
      limits: {
        fileSize: 10000000,
        files: 1
      }
    }

    const uploadAvatar = multer(multerConfig).single('avatar')

    uploadAvatar(req, res, err => {
      if (err) {
        return res.failure(-1, err, 200)
      } else {
        const path = `/uploads/${USER.id}/avatar/${imageName}`

        const FILTER = {
          _id: USER._id
        }

        const UPDATE = {
          $set: {
            'local.avatar': path
          }
        }

        const EXTRA = {
          new: true,
          upsert: true
        }

        User
          .findOneAndUpdate(FILTER, UPDATE, EXTRA, (err, userUpdated) => {
            if (err) {
              return res.failure(-2, err, 200)
            } else {
              return res.success(userUpdated, 200)
            }
          }) // User.findOneAndUpdate()
      } // if/else
    }) // uploadAvatar
  }) // mkdirp()
}

/**
 * Usuario actualiza contraseña manualmente
 */
exports.changePassword = (req, res, next) => {
  const B = req.body

  if (!B.id) {
    return res.failure(-1, 'Usuario no identificado', 200)
  }

  const FILTER = {
    _id: req.body.id
  }

  const password = B.password || ''
  const newPassword = B.newPassword || ''

  User
    .findById(FILTER, (err, user) => {
      if (!user) {
        return res.failure(-1, 'Usuario no encontrado', 200)
      } else {
        const isCreationMethodValid = checkCreationMethod(user.local.creationMethod)

        if (!isCreationMethodValid) {
          return res.failure(-2, 'Metodo de registración no válido', 200)
        } else {
          if (!user.validPassword(password)) {
            return res.failure(-3, 'Ha ingresado una contraseña actual incorrecta', 200)
          } else {
            user.local.password = user.generateHash(newPassword)

            user
              .save((err) => {
                if (err) {
                  return res.failure(-4, err, 200)
                } else {
                  return res.success('Contraseña actualizada', 200)
                }
              })
          } // if/else
        } // if/else
      } // if/else
    }) // User.findById()
}

/**
 * Usuario olvida contraseña
 */
exports.requestPassword = (req, res, next) => {
  const {
    email = ''
  } = req.body

  if (!validator.isEmail(email)) {
    return res.failure(-1, 'Ingrese un email válido', 200)
  } else {
    const FILTER = {
      'local.email': email,
      'local.creationMethod': 'local'
    }

    const UPDATE = {
      $set: {
        'local.resetPassword.token': randomstring.generate(50),
        'local.resetPassword.tokenExpires': Date.now() + 3600000
      }
    }

    const EXTRA = {
      safe: true,
      new: true
    }

    User
      .findOneAndUpdate(FILTER, UPDATE, EXTRA, (err, user) => {
        if (err) {
          console.log(`No se envia correo. Error: ${err}`)
          return res.success('En breve recibirá un correo con un link a la dirección indicada', 200)
        } else {
          const info = {
            app: {
              name: APP.name,
              url: APP.getENV().url,
              clientURI: `http://localhost:8080`
            },
            email,
            token: user.local.resetPassword.token
          } // info

          requestPasswordTemplate
            .render(info, (err, result) => {
              if (err) {
                console.log(`Error: ${err}`)
              } else {
                const mailOptions = {
                  from: 'info@jefecito.io', 
                  to: [
                    email
                  ],
                  subject: 'Restrablecer contraseña',
                  html: result.html
                }

                transporter
                  .sendMail(mailOptions, (error, info) => {
                    if (error) {
                      console.log(error)
                    } else {
                      console.log(`Correo electrónico enviado: ${info.response}`)
                    } // if/else
                  }) // transporter.sendMail()
              } // if/else
            }) // emailTx.render()

          return res.success('En breve recibirá un correo con un link a la dirección indicada', 200)
        }
      })
  }
}

/**
 * Usuario cambia contraseña en base a requestPassword
 */
exports.resetPassword = (req, res, next) => {
  const {
    token,
    password
  } = req.body

  if (password.length < 7) {
    return res.failure(-1, 'La contraseña debe ser mayor a siete caracteres', 200)
  } else if(!token) {
    return res.failure(-1, 'Token inválido', 200)
  } else {
    const FILTER = {
      'local.resetPassword.token': token,
      'local.resetPassword.tokenExpires': {
        $gt: Date.now()
      }
    }

    const UPDATE = {
      $set: {
        'local.password': bcrypt.hashSync(password, bcrypt.genSaltSync(10), null),
        'local.resetPassword.token': undefined,
        'local.resetPassword.tokenExpires': undefined
      }
    }

    const EXTRA = {
      safe: true,
      new: true
    }

    User
      .findOneAndUpdate(FILTER, UPDATE, EXTRA, (err, userUpdated) => {
        if (err) {
          return res.failure(-1, err, 200)
        } if(!userUpdated) {
          return res.failure(-1, 'Usuario inválido', 200)
        } else {
          return res.success('Contraseña actualizada', 200)
        }
      })
  } // if/else
}

/**
 * Verifica que el token no este expirado 
 * o sea un token válido, y devuelvo la hora
 * en que expira
 */
exports.getInfoTokenPassword = (req, res, next) => {
  const {
    token = ''
  } = req.query

  if (!token) {
    return res.failure(-1, 'Token inválido', 200)
  }

  const FILTER = {
    'local.resetPassword.token': token,
    'local.resetPassword.tokenExpires': {
      $gt: Date.now()
    }
  }

  User
    .findOne(FILTER, (err, user) => {
      if (!user) {
        return res.failure(-1, 'Token inválido o expirado', 200)
      } else {
        return res.success(user.local.resetPassword.tokenExpires, 200)
      }
    }) // User.findOne()
}

/**
 * Funciones auxiliares
 * 
 * Chequea el método de registración
 */
function checkCreationMethod(method) {
  if (method == 'local' || method == 'superadmin') {
    return true
  }

  return false
}