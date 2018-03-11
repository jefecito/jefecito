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
};/* messagerSend */

// Create App Configuration
//======================================================================
$("#createAppConfigBtn").on("click", function(e) {
  $("#createAppConfigBtn").prop("disabled", true);
  $("#createAppConfigBtn span").html('<i class="fa fa-refresh fa-spin fa-fw"></i>');

  var appName = $("#appName").val();
  var appURL  = $("#appURL").val();

  var data = {
    name: appName,
    url: appURL,
    configured: true
  }; /* data */

  try {
    $.ajax({
      type: 'POST',
      url: '/appConfig',
      data: data,
      success: function(res) {
        $("#createAppConfigBtn").prop("disabled", false);
        $("#createAppConfigBtn span").html('Inicializar Aplicación');
        console.log("res >>> ", res);
        if(res.success) {
          window.location.href = "/";
        } else {
          messagerSend("Error inicializando aplicación", "error");
        }
      }, /* success */
      error: function(err) {
        console.log("err >>> ", err);
        $("#createAppConfigBtn").prop("disabled", false);
        $("#createAppConfigBtn span").html('Inicializar Aplicación');
        messagerSend("Error Interno", "error");
      } /* error */
    }); /* ajax */
  } catch(err) {
    console.log("err >>> ", err);
    $("#createAppConfigBtn").prop("disabled", false);
    $("#createAppConfigBtn span").html('Inicializar Aplicación');
    messagerSend("Error Interno", "error");
  }; /* try/catch */
}); /* createAppConfigBtn */

$("#appName, #appURL").on("keyup", function(e) {
  var appName = $("#appName").val();
  var appURL  = $("#appURL").val();
  var status  = checkInputs(appName, appURL);
  if(status)
    $("#createAppConfigBtn").prop("disabled", false);
  else
    $("#createAppConfigBtn").prop("disabled", true);
}); /* #appName, #appURL */

var checkInputs = function(name, url) {
  if(name.length === 0)
    return false;
  if(url.length === 0)
    return false;
  return true;
}; /* checkInputs */