// Global Variable
//======================================================================
//======================================================================
var userTable;

// Init Emtpy Table in Fail Case
//======================================================================
//======================================================================
var initEmptyTable = function() {
  userTable = $("#userTable").DataTable({
    "bLengthChange": false,
    "order": [[0, 'desc']],
    "language": {
      "search"            : "",
      "searchPlaceholder" : "Buscar usuarios...",
      "lengthMenu"        : "Mostrar _MENU_ usuarios por página",
      "zeroRecords"       : "La búsqueda no dió resultados",
      "loadingRecords"    : "Cargando...",
      "processing"        : "Procesando...",
      "info"              : "Página _PAGE_ de _PAGES_",
      "infoEmpty"         : "No hay usuarios disponibles",
      "emptyTable"        : "No hay información disponible en la tabla\n<br>",
      "infoFiltered"      : "(filtrado de _MAX_ usuarios en total)",
      "paginate" : {
        "next"            : "Siguiente",
        "previous"        : "Anterior"
      }
    }
  }); /* userClaimsTable.DataTable() */
}; /* initEmptyTable() */

// Render User Table
//======================================================================
//======================================================================
var renderUserTable = function() {
  Pace.ignore(function(){
    try { userTable.destroy(); } catch(err) { /* do nothing */}
    try {
      userTable = $('#userTable').DataTable({
        "serverSide": false,
        "ajax": {
          "url": "/api/users",
          "type": "GET"
        },
        "columns": [
          {
            "render": function (data, type, full, meta) {
              var userRow = full;
              return '<img class="avatar-table" src="'+userRow.local.avatar+'">';
            }
          },
          { "data": "local.username" },
          { "data": "local.email" },
          {
            "render": function (data, type, full, meta) {
              var userRow = full;
              return moment(userRow.local.createdAt).format("DD/MM/YYYY HH:mm:ss");
            }
          },
          { "data": "local.creationMethod" },
          {
            "render": function (data, type, full, meta) {
              var userRow = full;
              var $divView = '<button class="btn btn-default btn-sm btn-table" style="margin-right: 5px;" onClick="viewUser(\''+userRow._id+'\')">'+
                               '<i class="fa fa-eye"></i>'+
                             '</button>';

              if(user_id === userRow._id) {
                var $divDelete = "";
              } else {
                var $divDelete = '<button class="btn btn-default btn-sm btn-table" onClick="deleteUser(\''+userRow._id+'\')">'+
                                   '<i class="fa fa-trash"></i>'+
                                 '</button>';
              }
                             
              return '<div class="">'+$divView+$divDelete+'</div>';
            }
          }
        ],
        "language": {
          "search": "Buscar",
          "lengthMenu": "Mostrar _MENU_ usuarios por página",
          "zeroRecords": "La búsqueda no dió resultados",
          "info": "Página _PAGE_ de _PAGES_",
          "infoEmpty": "No hay usuarios disponibles",
          "infoFiltered": "(filtrada de _MAX_ usuarios en total)",
          "paginate": {
            "first": "Primera",
            "last": "Última",
            "next": "Siguiente",
            "previous": "Anterior"
          },
        }
      });
    } catch(err) { initEmptyTable(); }
  }); /* Pace.ignore() */
}; /* renderUserTable */

// View User Information
//======================================================================
//======================================================================
var viewUser = function(idUser) {
  try {
    $.ajax({
      type: 'GET',
      url: '/api/users',
      data: { id: idUser },
      success: function(res) {
        if(res.success) {
          $('#infoUserAvatar').attr("src", res.data[0].local.avatar);
          $('#infoUserId').text(res.data[0]._id);
          $('#infoUserName').text(res.data[0].local.username);
          $('#infoUserEmail').text(res.data[0].local.email);
          
          if(res.data[0].local.isConfirmed)
            $('#infoUserConfirmed').text("Si");
          else
            $('#infoUserConfirmed').text("No");
          
          $('#indoUserCreatedAt').text(moment(res.data[0].local.createdAt).format("DD/MM/YYYY HH:mm:ss"));
          $('#infoUserModal').modal('toggle');
        } else {
          messagerSend("Error cargando información", "error");
        } /* if/else */
      }, /* success */
      error: function(err) {
        messagerSend("Error Interno", "error");
      } /* error */
    }); /* $.ajax() */
  } catch(err) {
    messagerSend("Error Interno", "error");
  }; /* try/catch */
}; /* viewUser */


// Delete User Main Function
//======================================================================
//======================================================================
var deleteUser = function(idUser) {
  try {
    $.ajax({
      type: 'GET',
      url: '/api/users',
      data: { id: idUser },
      success: function(res) {
        if(res.success) {
          $('#deleteUserAvatar').attr("src", res.data[0].local.avatar);
          $('#deleteUserId').text(res.data[0]._id);
          $('#deleteUserName').text(res.data[0].local.username);
          $('#deleteUserEmail').text(res.data[0].local.email);
          
          if(res.data[0].local.isConfirmed)
            $('#deleteUserConfirmed').text("Si");
          else
            $('#deleteUserConfirmed').text("No");
          
          $('#deleteUserCreatedAt').text(moment(res.data[0].local.createdAt).format("DD/MM/YYYY HH:mm:ss"));
          $('#deleteUserModal').modal('toggle');
        } else {
          messagerSend("Error cargando información", "error");
        } /* if/else */
      }, /* success */
      error: function(err) {
        messagerSend("Error Interno", "error");
      } /* error */
    }); /* $.ajax() */
  } catch(err) {
    messagerSend("Error Interno", "error");
  }; /* try/catch */
  $('#deleteUserBtn').attr('onclick', 'confirmDeleteUser(\''+idUser+'\')');
}; /* deleteUser() */


// Confirm Delete User (Modal)
//======================================================================
//======================================================================
var confirmDeleteUser = function(idUser) {
  $('#deleteUserBtn').prop('disabled', true);
  $("#deleteUserBtn span").html('<i class="fa fa-refresh fa-spin fa-fw"></i>');
  try {
    $.ajax({
      type: 'POST',
      url: '/api/user/delete',
      data: { id: idUser },
      success: function(result) {
        $('#deleteUserBtn').prop('disabled', false);
        $("#deleteUserBtn span").html('Eliminar');
        if(result.success) {
          $('#deleteUserModal').modal('hide');
          $('#userTable').DataTable().ajax.reload();
          messagerSend("Usuario eliminado", "success");
        } else {
          messagerSend(result.data, "error");
        } /* if/else */
      }, /* success */
      error: function(err) {
        $('#deleteUserBtn').prop('disabled', false);
        $("#deleteUserBtn span").html('Eliminar');
        messagerSend("Error Interno", "error");
      } /* error */
    }); /* $.ajax() */
  } catch(err) {
    $('#deleteUserBtn').prop('disabled', false);
    $("#deleteUserBtn span").html('Eliminar');
    messagerSend("Error Interno", "error");
  }; /* try/catch */
}; /* confirmDeleteUser */


// Function Inits
//======================================================================
//======================================================================
renderUserTable();