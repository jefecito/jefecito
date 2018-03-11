var infoHtml = '<li><a>No hay notificaciones.</a></li> <!-- /li -->'

// Navbar Alert
//======================================================================
var getAlerts = function() {
  try {
    $.ajax({
      type: 'GET',
      url: '/userAlerts',
      success: function(res) {
        if(res.success) {
          var arrAlerts = res.data;
          var i;
          var $div = '<li class="dropdown-header">Nuevas Notificaciones</li>';

          for(i = 0; i < arrAlerts.length; i++) {
            var alert = arrAlerts[i];
            $div = $div + '<li data-alert-id=\''+alert._id+'\' class="alert-pointer">'+
                            '<a href>'+
                              alert.msg+
                            '</a>'+
                          '</li> <!-- /li -->';
          } /* for */

          $("#alert-dropdown").html($div);
        } else {
          $("#alert-dropdown").html(infoHtml);
          messagerSend('Error alertas', 'error');
        } /* if/else */
      },
      error: function(err) {
        $("#alert-dropdown").html(infoHtml);
        messagerSend('Error Interno', 'error');
        console.log("err >>> ", err);
      } /* error */
    }); /* ajax */
  } catch(err) {
    $("#alert-dropdown").html(infoHtml);
    messagerSend('Error Interno', 'error');
    console.log("err >>> ", err);
  } /* try/catch */
}; /* getAlerts */