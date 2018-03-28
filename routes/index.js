/* jshint esversion: 6 */

module.exports = application => {
  /**
   * Import auth routes
   */
  require('./authRoute')(application)

  /**
   * Import user routes
   */
  require('./userRoute')(application)
}