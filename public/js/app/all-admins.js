// Global Variable
//======================================================================
//======================================================================
var adminTable;
var globalIdAdmin;

// Init Emtpy Table in Fail Case
//======================================================================
//======================================================================
var initEmptyTable = function() {
  adminTable = $("#adminTable").DataTable({
    "bLengthChange": false,
    "order": [[0, 'desc']],
    "language": {
      "search"            : "",
      "searchPlaceholder" : "Buscar administradores...",
      "lengthMenu"        : "Mostrar _MENU_ administradores por página",
      "zeroRecords"       : "La búsqueda no dió resultados",
      "loadingRecords"    : "Cargando...",
      "processing"        : "Procesando...",
      "info"              : "Página _PAGE_ de _PAGES_",
      "infoEmpty"         : "No hay administradores disponibles",
      "emptyTable"        : "No hay información disponible en la tabla\n<br>",
      "infoFiltered"      : "(filtrado de _MAX_ administradores en total)",
      "paginate" : {
        "next"            : "Siguiente",
        "previous"        : "Anterior"
      }
    }
  }); /* userClaimsTable.DataTable() */
}; /* initEmptyTable() */

// Render Admin Table
//======================================================================
//======================================================================
var renderAdminTable = function() {
  try { adminTable.destroy() } catch(err) { /* do nothing */ }
  try {
    adminTable = $('#adminTable').DataTable({
      "serverSide": false,
      "ajax": {
        "url": "/api/admins",
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
            return moment(userRow.createdAt).format("DD/MM/YYYY HH:mm:ss");
          }
        },
        { "data": "local.creationMethod" },
        {
          "render": function (data, type, full, meta) {
            var userRow = full;
            if(user_id === userRow._id) {
              var $divRemove = "";
            } else {
              var $divRemove = '<button class="btn btn-default btn-sm btn-table" onClick="removeAdmin(\''+userRow._id+'\')">'+
                                 '<i class="fa fa-trash"></i>'+
                               '</button>';
            }
            return '<div class="">'+$divRemove+'</div>';
          }
        }
      ],
      "language": {
        "search": "Buscar",
        "lengthMenu": "Mostrar _MENU_ administradores por página",
        "zeroRecords": "La búsqueda no dió resultados",
        "info": "Página _PAGE_ de _PAGES_",
        "infoEmpty": "No hay administradores disponibles",
        "infoFiltered": "(filtrada de _MAX_ administradores en total)",
        "paginate": {
          "first": "Primera",
          "last": "Última",
          "next": "Siguiente",
          "previous": "Anterior"
        },
      }
    });
  } catch(err) {
    initEmptyTable();
  } /* try/catch */
}; /* renderAdminTable() */

// Remove Admin
//======================================================================
//======================================================================
var removeAdmin = function(idAdmin) {
  try {
    $.ajax({
      type: 'GET',
      url: '/api/users',
      data: { id: idAdmin },
      success: function(res) {
        if(res.success) {
          $('#deleteAdminAvatar').attr("src", res.data[0].local.avatar);
          $('#deleteAdminId').text(res.data[0]._id);
          $('#deleteAdminUser').text(res.data[0].local.username);
          $('#deleteAdminEmail').text(res.data[0].local.email);
          
          if(res.data[0].local.isConfirmed)
            $('#deleteAdminConfirmed').text("Si");
          else
            $('#deleteAdminConfirmed').text("No");
          
          $('#deleteAdminCreatedAt').text(moment(res.data[0].local.createdAt).format("DD/MM/YYYY HH:mm:ss"));
          $('#removeAdminModal').modal('toggle');
        } else {
          messagerSend("Error cargando información", "error");
        } /* if/else */
      }, /* success */
      error: function(err) {
        messagerSend("Error Interno", "error");
      } /* error */
    }); /* $ajax.() */
  } catch(err) {
    messagerSend("Error Interno", "error");
  }; /* try/catch */
  $('#deleteAdminBtn').attr('onclick', 'confirmRemoveAdmin(\''+idAdmin+'\')');
}; /* removeAdmin() */

// Confirm Remove Admin
//======================================================================
//======================================================================
var confirmRemoveAdmin = function(idAdmin) {
  $("#deleteAdminBtn").prop("disabled", true);
  $("#deleteAdminBtn span").html('<i class="fa fa-refresh fa-spin fa-fw"></i>');
  try {
    $.ajax({
      type: 'PUT',
      url: '/api/user/toUser',
      data: { id: idAdmin },
      success: function(res) {
        $("#deleteAdminBtn").prop("disabled", false);
        $("#deleteAdminBtn span").html('Remover');
        if(res.success) {
          $("#removeAdminModal").modal("toggle");
          messagerSend(res.data, "success");
          $('#adminTable').DataTable().ajax.reload();
        } else {
          messagerSend(res.data, "error");
        } /* if/else */
      }, /* success */
      error: function(err) {
        messagerSend("Error Interno", "error");
        $("#deleteAdminBtn").prop("disabled", false);
        $("#deleteAdminBtn span").html('Remover');
      } /* error */
    }); /* $.ajax() */
  } catch(err) {
    messagerSend("Error Interno", "error");
    $("#deleteAdminBtn").prop("disabled", false);
    $("#deleteAdminBtn span").html('Remover');
  }; /* try/catch */
}; /* confirmRemoveAdmin */

// Add New Admin
//======================================================================
//======================================================================
var addNewAdmin = function() {
  try {
    $.ajax({
      type: 'GET',
      url: '/api/users',
      success: function(res) {
        if(res.success) {
          var usersArray = $.map(res.data, function(obj, i) {
            if(obj.local.roles[0] != "admin")
              return { id: obj._id, text: obj.local.username, full: obj };
          }); /* $.map() */

          $('#selectUser').select2({
            data: usersArray,
            dropdownParent: $("#addNewAdminModal"),
            placeholder: "Usuarios",
            width: "100%"
          }); /* #selectUser.select2() */

          $("#userToAdminInner").hide();
          $("#addNewAdminModal").modal("toggle");
        } else {
          messagerSend("Error cargando usuarios", "error");
        } /* if/else */
      }, /* success */
      error: function(err) {
        messagerSend("Error Interno", "error");
      } /* error */
    }); /* ajax */
  } catch(err) {
    messagerSend("Error Interno", "error");
  }; /* try/catch */
}; /* addNewAdmin */

// Get User Select2
//======================================================================
//======================================================================
$('#selectUser').on("select2:select", function(e) {
  var userInfo = $("#selectUser").select2("data")[0].full;
  globalIdAdmin = userInfo._id;
  $('#addAdminAvatar').attr("src", userInfo.local.avatar);
  $('#addAdminId').text(userInfo._id);
  $('#addAdminUsername').text(userInfo.local.username);
  $('#addAdminEmail').text(userInfo.local.email);
  if(userInfo.local.isConfirmed)
    $('#addAdminConfirmed').text("Si");
  else
    $('#addAdminConfirmed').text("No");
  $('#addAdminCreatedAt').text(moment(userInfo.local.createdAt).format("DD/MM/YYYY HH:mm:ss"));
  $("#userToAdminInner").show();
  $("#confirmAddAdminBtn").prop("disabled", false);
}); /* selectUser */

// Confirm Add New Admin
//======================================================================
//======================================================================
$("#confirmAddAdminBtn").on("click", function(e) {
  $("#confirmAddAdminBtn").prop("disalbed", true);
  $("#confirmAddAdminBtn span").html('<i class="fa fa-refresh fa-spin fa-fw"></i>');
  try {
    $.ajax({
      type: 'PUT',
      url: '/api/user/toAdmin',
      data: { id: globalIdAdmin },
      success: function(res) {
        $("#confirmAddAdminBtn").prop("disalbed", false);
        $("#confirmAddAdminBtn span").html('Agregar');
        if(res.success) {
          $("#addNewAdminModal").modal("toggle");
          messagerSend(res.data, "success");
          $('#adminTable').DataTable().ajax.reload();
        } else {
          messagerSend(res.data, "error");
        } /* if/else */
      }, /* success */
      error: function(err) {
        messagerSend("Error Interno", "error");
        $("#confirmAddAdminBtn").prop("disalbed", false);
        $("#confirmAddAdminBtn span").html('Agregar');
      } /* error */
    }); /* ajax */
  } catch(err) {
    messagerSend("Error Interno", "error");
    $("#confirmAddAdminBtn").prop("disalbed", false);
    $("#confirmAddAdminBtn span").html('Agregar');
  } /* try/catch */
}); /* confirmAddAdminBtn */

// New Admin Modal Events
//======================================================================
//======================================================================
$("#addNewAdminModal").on("hidden.bs.modal", function(e) {
  $('#selectUser').val(null).change();
  $("#userToAdminInner").hide();
  $("#confirmAddAdminBtn").prop("disabled", true);
}); /* addNewAdminModal */

// Function Inits
//======================================================================
//======================================================================
renderAdminTable();