// Global Variables
//======================================================================
var fd = new FormData();
var fileToUpload;
var globalEmail;
var globalUsername;


// File Input Init
//======================================================================
$("#updateAvatarInput").fileinput({
  uploadAsync: true,
  maxFileCount: 1,
  showUpload: false,
  showPreview: false,
  browseLabel: 'Buscar',
  browseIcon: '',
  removeLabel: 'Remover',
  removeIcon: '',
  uploadLabel: 'Subir',
  uploadIcon: ''
});

// Update Avatar Function
//======================================================================
var updateAvatar = function() {
  $("#updateAvatarBtn").prop("disabled", true);
  $("#updateAvatarBtn span").html('<i class="fa fa-refresh fa-spin fa-fw"></i>');
  fd.append('avatar', fileToUpload);
  try {
    $.ajax({
      type: 'POST',
      url: '/profile/avatar/upload',
      enctype: 'multipart/form-data',
      data: fd,
      cache: false,
      contentType: false,
      processData: false,
      success: function(res) {
        if(res.success) {
          messagerSend("Avatar subido exitosamente", "success");
          getAvatar();
          getUserSidebar(); /* update user information on sidebar (sidebar.js) */
          fd.delete('avatar');
          fileToUpload = null;
          $("#updateAvatarBtn span").text('Cambiar Avatar');
          $("#updateAvatarInput").fileinput('clear');
        } else {
          messagerSend("Error cargando avatar", "error");
        }
      }, /* success */
      error: function(err) {
        console.log("err >>> ", err);
        messagerSend("Error Interno", "error");
      } /* error */
    }); /* ajax */
  } catch(err) {
    console.log("err >>> ", err);
    messagerSend("Error Interno", "error");
  }; /* try/catch */
}; /* updateAvatar */

$("#updateAvatarInput").on("change", function(event) {
  $("#updateAvatarBtn").prop("disabled", false);
  fileToUpload = event.target.files[0];
}); /* newDocInput */

var getAvatar = function() {
  try {
    $.ajax({
      type: 'POST',
      url: '/user',
      success: function(res) {
        if(res.success) {
          d = new Date();
          $("#userAvatar").attr("src", res.data.local.avatar+"?"+d.getTime());
          $("#newUser").val(res.data.local.username);
          $("#newEmail").val(res.data.local.email);
          globalEmail    = res.data.local.username;
          globalUsername = res.data.local.email;
        } else {
          $("#userAvatar").attr("src", "/img/default.png");
        }
      }, /* success */
      error: function(err) {
        console.log("err >>> ", err);
        $("#userAvatar").attr("src", "/img/default.png");
      } /* error */
    }); /* ajax */
  } catch(err) {
    $("#userAvatar").attr("src", "/img/default.png");
  } /* try/catch */
}; /* getAvatar */

getAvatar();


// Update Password Function
//======================================================================
var updatePassword = function() {
  var Pw      = $("#oldPassword").val();
  var newPw   = $("#newPassword").val();
  var reNewPw = $("#reNewPassword").val();

  var status  = checkPasswordInputs(Pw, newPw, reNewPw);

  var data = {
    id: userID, // user-sidebar.js global variable
    password: Pw,
    newPassword: newPw
  }; /* data */

  if(!status) {
    messagerSend("Campos incompletos", "error");
  } else {
    if(newPw != reNewPw) {
      messagerSend("Las contraseñas deben coincidir", "error");
    } else {
      $("#updatePasswordBtn").prop("disabled", true);
      $("#updatePasswordBtn span").html('<i class="fa fa-refresh fa-spin fa-fw"></i>');
      try {
        $.ajax({
          type: 'PUT',
          url: '/api/user/changepassword',
          data: data,
          success: function(res) {
            $("#updatePasswordBtn").prop("disabled", false);
            $("#updatePasswordBtn span").html('Cambiar Contraseña');
            if(res.success) {
              messagerSend("Contraseña actualizada", "success");
              $("#oldPassword").val("");
              $("#newPassword").val("");
              $("#reNewPassword").val("");
            } else {
              messagerSend("Error actualizando contraseña", "error");
            }
          }, /* success */
          error: function(err) {
            $("#updatePasswordBtn").prop("disabled", false);
            $("#updatePasswordBtn span").html('Cambiar Contraseña');
            messagerSend("Error Interno", "error");
          } /* error */
        }); /* ajax */
      } catch(err) {
        $("#updatePasswordBtn").prop("disabled", false);
        $("#updatePasswordBtn span").html('Cambiar Contraseña');
        messagerSend("Error Interno", "error");
      }; /* try/catch */
    } /* if/else */
  } /* if/else */
}; /* updatePassword */

var checkPasswordInputs = function(pw, newPw, reNewPw) {
  if(pw.length === 0)
    return false;
  if(newPw.length === 0)
    return false;
  if(reNewPw.length === 0)
    return false;

  return true;
}; /* checkPasswordInputs */


// Update Email and Username Function
//======================================================================
var updateUserEmail = function() {
  $("#updateUserEmailBtn").prop("disabled", true);
  $("#updateUserEmailBtn span").html('<i class="fa fa-refresh fa-spin fa-fw"></i>');

  var data = {
    id: userID, // user-sidebar.js global variable
    username: $("#newUser").val(),
    email: $("#newEmail").val()
  }; /* data */

  try {
    $.ajax({
      type: 'PUT',
      url: '/api/user/update',
      data: data,
      success: function(res) {
        $("#updateUserEmailBtn").prop("disabled", false);
        $("#updateUserEmailBtn span").html('Cambiar Datos');
        if(res.success) {
          messagerSend("Datos actualizados", "success");
          getUserSidebar(); /* update user information on sidebar (sidebar.js) */
        } else {
          messagerSend("Error actualizando datos", "error");
        }
      }, /* success */
      error: function(err) {
        $("#updateUserEmailBtn").prop("disabled", false);
        $("#updateUserEmailBtn span").html('Cambiar Datos');
        messagerSend("Error Interno", "error");
      } /* error */
    }); /* ajax */
  } catch(err) {
    $("#updateUserEmailBtn").prop("disabled", false);
    $("#updateUserEmailBtn span").html('Cambiar Datos');
    messagerSend("Error Interno", "error");
  }; /* try/catch */
}; /* updateUserEmail */

$("#newEmail, #newUser").on("keyup", function(e) {
  var newEmail = $("#newEmail").val();
  var newUser  = $("#newUser").val();
  var status   = checkInputs(newEmail, newUser);
  if(status) {
    $("#updateUserEmailBtn").prop("disabled", false);
  } else {
    $("#updateUserEmailBtn").prop("disabled", true);
  } /* if/else */
});

var checkInputs = function(email, user) {
  if(email.length === 0)
    return false;
  if(user.length === 0)
    return false;

  return true;
}; /* checkInputs */