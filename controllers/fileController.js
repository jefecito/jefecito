/* jshint esversion: 6 */

// Modulos
const mongoose = require('mongoose')
const mkdirp = require('mkdirp')
const multer = require('multer')
const fs = require('fs')

// Modelos
const Files = mongoose.model('Upload')
const User = mongoose.model('Upload')

// User APIS
// Trae los archivos de un usuario (públicos y asignados)
exports.getUserFiles = (req, res, next) => {
  const {
    id
  } = req.query
  let FILTER = {
    'uploadTo.global': true
  }

  if (!id) {
    FILTER._id = id
  }

  Files
    .find(FILTER, (err, globalDocuments) => {
      if (err) {
        return res.failure(-1, err, 200)
      } else {
        FILTER = {
          _id: req.user._id
        }

        User
          .findById(FILTER)
          .populate('local.uploadedDocuments')
          .exec((err, user) => {
            if (err) {
              return res.failure(-2, err, 200)
            } else {
              const fullDocuments = [
                ...globalDocuments,
                ...user.local.uploadedDocuments
              ]

              return res.success(fullDocuments, 200)
            }
          }) // exec()
      } // if/else
    }) // Files.find()
} // getUserFiles()

// Subir un archivo
exports.uploadFile = (req, res, next) => {
  mkdirp('document/upload', (err) => {
    // Config Storage
    const storageConfig = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, 'document/upload');
      },
      filename: (req, file, cb) => {
        cb(null, file.originalname);
      }
    })

    // Config Multer
    const multerConfig = {
      storage: storageConfig,
      limits: {
        fileSize: 10000000,
        files: 15
      }
    }

    const uploadDocument = multer(multerConfig).array('document', 15)

    uploadDocument(req, res, err => {
      if (err) {
        return res.failure(-1, err, 200);
      } else {
        const {
          folder,
          global,
          usersArray
        } = req.body

        // Genero los archivos
        const filesArray = req.files.map(file => {
          let newFile = new Files({
            uploadedBy: req.user._id,
            uploadedAt: Date.now(),
            uploadName: file.originalname,
            uploadSize: file.size,
            uploadPath: file.path,
            uploadAlias: file.originalname,
            uploadTo: {
              folder: folder
            }
          })

          if (global) {
            newFile.uploadTo.global = true
          } else {
            newFile.uploadTo.users = JSON.parse(usersArray)
          }
        })

        // Subo los archivos
        Files
          .insertMany(filesArray, (err, files) => {
            if(err) {
              return res.failure(-2, err, 200);
            } else {
              const documentIds = files.map(file => {
                return file._id
              })

              const FILTER = {
                _id: {
                  $in: usersArr
                }
              }

              const UPDATED = {
                $push: {
                  'local.uploadedDocuments': {
                    $each: documentIds
                  }
                }
              }

              const EXTRAS = {
                multi: true
              }

              // Actualizo los usuarios a los cuales
              // les asigné dichos archivos
              User
                .update(FILTER, UPDATED, EXTRAS, (err, updated) => {
                  if (err) {
                    return res.failure(-3, err, 200)
                  } else {
                    return res.success(files, 200)
                  }
                }) // User.update()
            } // if/else
          }) // Upload.insertMany()
      } // if/else
    }) // uploadDocument()
  }) // mkdirp()
} // uploadFile()

// Descargar un archivo
exports.downloadFile = (req, res, next) => {
  const {
    id
  } = req.body

  if (!id) {
    return res.failure(-1, 'Archivo no identificado', 200)
  }

  const FILTER = {
    _id: id
  }

  const UPDATED = {
    $inc: {
      downloadCounter: 1
    }
  }

  const EXTRA = {
    new: true,
    safe: true
  }

  Files
    .findOneAndUpdate(FILTER, UPDATED, EXTRA, (err, document) => {
      if (err) {
        return res.failure(-1, err, 200)
      } else if(!doc) {
        return res.failure(-2, 'Archivo inválido', 200)
      } else {
        return res.download(document.uploadPath)
      }
    })
} // downloadFile()

// Admin APIS
// Trae TODOS los archivos subidos en el servidor
exports.getAllFiles = (req, res, next) => {
  const {
    id
  } = req.query

  let FILTER = {};

  if (!id) {
    FILTER._id = id
  }

  Files
    .find(FILTER, (err, documents) => {
      if (err) {
        return res.failure(-1, err, 200)
      } else {
        return res.success(documents, 200)
      } // if/else
    }) // Files.find()
} // getAllFiles()

// Elimina un archivo
exports.deleteFile = (req, res, next) => {
  const {
    id
  } = req.body

  if (!id) {
    return res.failure(-1, 'Archivo no identificado', 200)
  }

  const FILTER = {
    _id: id
  }

  const EXTRAS = {
    safe: true,
    new: false
  }

  Upload
    .findOneAndRemove(FILTER, EXTRAS, (err, file) => {
      if (err) {
        return res.failure(-1, err, 200)
      } else {
        fs.unlink(file.uploadPath, err => {
          if (err) {
            return res.failure(-2, err, 200)
          } else {
            return res.success('Archivo eliminado', 200)
          }
        }) // fs.unlink()
      } // if/else
    }) // Upload.findById()
} // deleteFile()