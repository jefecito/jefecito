// Login Submit
//======================================================================
$('#loginForm').on('submit', function(event) {
  event
    .preventDefault();

  $('#loginBtn span')
    .html('<i class="fa fa-refresh fa-spin fa-fw"></i>');

  $('#loginBtn, \
     #loginEmail, \
     #loginPassword')
    .prop('disabled', true);

  try {
    $.ajax({
      type: 'POST',
      url: '/login',
      data: {
        username: $('#loginEmail').val(),
        password: $('#loginPassword').val()
      },
      success: function(res) {
        if(res.success)
          window.location.href = res.data.redirect;
        else {
          $('#loginBtn span')
            .html('Ingresar');

          $('#loginBtn, \
             #loginEmail, \
             #loginPassword')
            .prop('disabled', false);

          $('#loginEmail, \
             #loginPassword')
            .addClass('inputError');

          messagerSend(res.data, 'error');
        }
      }, // success
      error: function(err) {
        $('#loginBtn span')
          .html('Ingresar');

        $('#loginBtn, \
           #loginEmail, \
           #loginPassword')
          .prop('disabled', false);

        $('#loginEmail, \
           #loginPassword')
          .addClass('inputError');

        messagerSend('Error Iniciando Sesión', 'error');
      } // error
    }); // $.ajax()
  } catch(err) {
    $('#loginBtn span')
      .html('Ingresar');

    $('#loginBtn, \
       #loginEmail, \
       #loginPassword')
      .prop('disabled', false);

    $('#loginEmail, \
       #loginPassword')
      .addClass('inputError');

    messagerSend('Error Interno', 'error');
  } // try/catch
}); // loginForm