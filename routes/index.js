/* jshint esversion: 6 */

module.exports = application => {
  // Auth routes
  require('./authRoute')(application)

  // User routes
  require('./userRoute')(application)
}