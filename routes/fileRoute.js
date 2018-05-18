/* jshint esversion: 6 */

// file controller function
const {
  getAllFiles,
  deleteFile,
  getUserFiles,
  uploadFile,
  downloadFile
} = require('../controllers/fileController')

// middlewares
const {
  rateLimiter,
  requireAuth,
  isAdmin
} = require('../middlewares/app')

module.exports = application => {
  // Listado y eliminación de archivos para admin
  application
    .route('/api/admin/files')
    .get(rateLimiter, requireAuth, isAdmin, getAllFiles)
    .delete(rateLimiter, requireAuth, isAdmin, deleteFile)

  // Trae todos los archivos para un usuario (públicos y asignados a él)
  application
    .route('/api/files')
    .get(rateLimiter, requireAuth, getUserFiles)

  // Alta archivos para usuario
  application
    .route('/api/file/upload')
    .post(rateLimiter, requireAuth, uploadFile)

  // Descargar archivo
  application
    .route('/api/file/download')
    .post(rateLimiter, requireAuth, downloadFile)
}