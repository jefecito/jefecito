// Pace Config
//======================================================================
window.paceOptions = {
  ajax: false,
  restartOnRequestAfter: false,
};

// DataTables Rules
//======================================================================
$.fn.dataTableExt.sErrMode = 'throw';
$.extend($.fn.dataTableExt.oStdClasses, {
  sFilterInput: 'form-control',
  sLengthSelect: 'form-control',
  sPaginationType: 'full_numbers'
});

// Messenger Options
//======================================================================
Messenger.options = {
  extraClasses: 'messenger-fixed messenger-on-bottom messenger-on-left',
  theme: 'flat'
}; // Messenger.options

// Messenger Function
//======================================================================
var messagerSend = function(msg, type) {
  Messenger().post({
    message: msg,
    type: type,
    showCloseButton: true
  });
}; // messagerSend()