// Messenger Options
//======================================================================
Messenger.options = {
  extraClasses: 'messenger-fixed messenger-on-bottom messenger-on-left',
  theme: 'flat'
}; /* Messenger.options */

// Messenger Function
//======================================================================
var messagerSend = function(msg, type) {
  Messenger().post({
    message: msg,
    type: type,
    showCloseButton: true
  });
}; // messagerSend()