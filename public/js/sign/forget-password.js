// Forget Password Submit
//======================================================================
$("#forgetPasswordForm").on("submit", function(e) {
  $('#forgetPasswordEmail').removeClass('inputError');
  var email = $('#forgetPasswordEmail').val();
  e.preventDefault();
  if(email.length === 0) {
    $('#forgetPasswordEmail').addClass('inputError');
    messagerSend('Campos Incompletos', 'error');
  } else {
    $("#forgetPasswordBtn span").html('<i class="fa fa-refresh fa-spin fa-fw"></i>');
    $("#forgetPasswordBtn").prop("disabled", true);
    $("#forgetPasswordEmail").prop("disabled", true);
    try {
      $.ajax({
        type: 'POST',
        url: '/api/user/token',
        data: { email: email },
        success: function(res) {
          $("#forgetPasswordBtn span").html("Enviar");
          $("#forgetPasswordBtn").prop("disabled", false);
          $("#forgetPasswordEmail").prop("disabled", false);
          if(res.success) {
            messagerSend(res.data, 'success');
          } else {
            messagerSend(res.data, 'info');
          };
        }, /* success */
        error: function(err) {
          $("#forgetPasswordBtn span").html("Enviar");
          $("#forgetPasswordBtn").prop("disabled", false);
          $("#forgetPasswordEmail").prop("disabled", false);
          messagerSend('Error Interno', 'error');
        } /* error */
      }); /* ajax */
    } catch(err) {
      $("#forgetPasswordBtn span").html("Enviar");
      $("#forgetPasswordBtn").prop("disabled", false);
      $("#forgetPasswordEmail").prop("disabled", false);
      messagerSend('Error Interno', 'error');
    } /* try/catch */
  } /* if/else */
}); /* registerForm */