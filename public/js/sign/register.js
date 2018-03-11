// Global Variable
//======================================================================
var pwScore,
    options = {
      common: {
        onKeyUp: function(evt, data) {
          pwScore = data.score;
        }
      },
      ui: {
        container: '#passwordInner',
        showVerdictsInsideProgressBar: true,
        viewports: {
          progress: '.pwstrength_viewport_progress'
        }
      }
    };

$('#registerPassword')
  .pwstrength(options);

// Register Submit
//======================================================================
$('#registerForm').on('submit', function(event) {
  event
    .preventDefault();

  $('#registerUser')
    .removeClass('inputError');
  $('#registerEmail')
    .removeClass('inputError');
  $('#registerPassword')
    .removeClass('inputError');

  var username = $('#registerUser').val(),
      email    = $('#registerEmail').val(),
      password = $('#registerPassword').val();

  if(username.length === 0 ||
     email.length === 0 ||
     password.length === 0) {
    $('#registerUser')
      .addClass('inputError');
    $('#registerEmail')
      .addClass('inputError');
    $('#registerPassword')
      .addClass('inputError');

    messagerSend('Campos Incompletos', 'error');
  } else {
    if(pwScore > 27) {
      $('#registerBtn')
        .html('<i class="fa fa-refresh fa-spin fa-fw"></i>');
      $('#registerBtn')
        .prop('disabled', true);
      $('#registerUser')
        .prop('disabled', true);
      $('#registerEmail')
        .prop('disabled', true);
      $('#registerPassword')
        .prop('disabled', true);

      try {
        $('#registerUser')
          .removeClass('inputError');
        $('#registerEmail')
          .removeClass('inputError');
        $('#registerPassword')
          .removeClass('inputError');

        $.ajax({
          type: 'POST',
          url: '/register',
          data: {
            username: username,
            email: email,
            password: password
          },
          success: function(res) {
            $('#registerBtn')
              .prop('disabled', false);
            $('#registerUser')
              .prop('disabled', false);
            $('#registerEmail')
              .prop('disabled', false);
            $('#registerPassword')
              .prop('disabled', false);
            $('#registerBtn')
              .html('Crear Cuenta');

            if(res.success) {
              $('#checkEmailAlert')
                .show();
              $('#checkEmailAlert')
                .html('<p>Revisa '+$('#registerEmail').val()+' para confirmar tu cuenta.</p>');
            } else {
              $('#registerUser')
                .addClass('inputError');
              $('#registerEmail')
                .addClass('inputError');
              $('#registerPassword')
                .addClass('inputError');

              messagerSend(res.error.message, 'error');
            }
          }, // success
          error: function(err) {
            $('#registerBtn')
              .html('Crear Cuenta');
            $('#registerBtn')
              .prop('disabled', false);
            $('#registerUser')
              .prop('disabled', false);
            $('#registerEmail')
              .prop('disabled', false);
            $('#registerPassword')
              .prop('disabled', false);
            $('#registerUser')
              .addClass('inputError');
            $('#registerEmail')
              .addClass('inputError');
            $('#registerPassword')
              .addClass('inputError');
            messagerSend('Error Interno', 'error');
          } // error
        }); // $.ajax()
      } catch(err) {
        messagerSend('Error Interno', 'error');
        $('#registerBtn')
          .html('Crear Cuenta');
        $('#registerBtn')
          .prop('disabled', false);
        $('#registerUser')
          .prop('disabled', false);
        $('#registerEmail')
          .prop('disabled', false);
        $('#registerPassword')
          .prop('disabled', false);
      } // try/catch
    } else {
      $('#registerPassword')
        .addClass('inputError');
      messagerSend('La fortaleza de la contraseña es muy debil', 'error');
    } // if/else
  } // if/else
}); // registerForm