// Login Submit
//======================================================================
$("#loginForm").on("submit", function(e) {
  $("#loginBtn span").html('<i class="fa fa-refresh fa-spin fa-fw"></i>');
  $('#loginBtn').prop('disabled', true);
  $('#loginEmail').prop('disabled', true);
  $('#loginPassword').prop('disabled', true);
  e.preventDefault();
  try {
    $.ajax({
      type: 'POST',
      url: '/login',
      data: {
        username: $('#loginEmail').val(),
        password: $('#loginPassword').val()
      },
      success: function(res) {
        console.log("res >>> ", res);
        if(res.success) {
          window.location.href = res.data.redirect;
        } else {
          $("#loginBtn span").html('Ingresar');
          $('#loginBtn').prop('disabled', false);
          $('#loginEmail').prop('disabled', false);
          $('#loginPassword').prop('disabled', false);
          $('#loginEmail').addClass('inputError');
          $('#loginPassword').addClass('inputError');
          messagerSend(res.data, 'error');
        };
      }, /* success */
      error: function(err) {
        $("#loginBtn span").html('Ingresar');
        $('#loginBtn').prop('disabled', false);
        $('#loginEmail').prop('disabled', false);
        $('#loginPassword').prop('disabled', false);
        $('#loginEmail').addClass('inputError');
        $('#loginPassword').addClass('inputError');
        messagerSend('Error Interno', 'error');
        console.log("err >>> ", err);
      } /* error */
    }); /* ajax */
  } catch(err) {
    console.log("err >>> ", err);
    $("#loginBtn span").html('Ingresar');
    messagerSend('Error Interno', 'error');
    $('#loginBtn').prop('disabled', false);
    $('#loginEmail').prop('disabled', false);
    $('#loginPassword').prop('disabled', false);
  } /* try/catch */
}); /* loginForm */