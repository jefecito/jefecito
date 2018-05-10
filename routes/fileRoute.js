/* jshint esversion: 6 */

// Modulos
const fileController = require('../controllers/fileController')
const mw = require('../middlewares/app')

module.exports = application => {
  // Listado y eliminación de archivos para admin
  application
    .route('/api/admin/files')
    .get(mw.rateLimiter, mw.requireAuth, mw.isAdmin, fileController.getAllFiles)
    .delete(mw.rateLimiter, mw.requireAuth, mw.isAdmin, fileController.deleteFile)

  // Trae todos los archivos para un usuario (públicos y asignados a él)
  application
    .route('/api/files')
    .get(mw.rateLimiter, mw.requireAuth, fileController.getUserFiles)

  // Alta archivos para usuario
  application
    .route('/api/file/upload')
    .post(mw.rateLimiter, mw.requireAuth, fileController.uploadFile)

  // Descargar archivo
  application
    .route('/api/file/download')
    .post(mw.rateLimiter, mw.requireAuth, fileController.downloadFile)
}