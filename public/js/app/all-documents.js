// Global Variables
//======================================================================
//======================================================================
var fd = new FormData();
var fileToUpload, globalDocId, globalState = false, flag = false;
var foldersName = [];

// DocTable Init
//======================================================================
//======================================================================
$('#docTable').DataTable({
  "processing": true,
  "serverSide": false,
  "ajax": {
    "url": "/api/adminUploads",
    "type": "GET"
  },
  "columns": [
    { "data": "uploadAlias" },
    { "data": "uploadedBy.username" },
    {
      "render": function (data, type, full, meta) {
        var size = full.uploadSize;
        size = size / 1024;
        return size.toFixed(2)+" KB";
      }
    },
    {
      "render": function (data, type, full, meta) {
        var userRow = full;
        return moment(userRow.uploadedAt).format("DD/MM/YYYY HH:mm:ss");
      }
    },
    {
      "render": function (data, type, full, meta) {
        var userRow = full;
        if(foldersName.indexOf(userRow.uploadTo.folder) === -1)
          foldersName.push(userRow.uploadTo.folder);
        return userRow.uploadTo.folder;
      }
    },
    { "data": "downloadCounter" },
    {
      "render": function (data, type, full, meta) {
        var userRow = full;
        return '<div class="">'+
                  '<a href="/file/download/'+userRow._id+'" style="margin-right: 5px;" class="btn btn-default btn-sm btn-table">'+
                    '<i class="fa fa-download"></i>'+
                  '</a>'+
                  '<button type="button" class="btn btn-default btn-sm btn-table" onClick="removeFile(\''+userRow._id+'\')">'+
                    '<i class="fa fa-trash"></i>'+
                  '</button>'+
                '</div>';
      }
    }
  ],
  "language": {
    "search": "Buscar",
    "lengthMenu": "Mostrar _MENU_ documentos por página",
    "zeroRecords": "La búsqueda no dió resultados",
    "info": "Página _PAGE_ de _PAGES_",
    "infoEmpty": "No hay documentos disponibles",
    "infoFiltered": "(filtrada de _MAX_ documentos en total)",
    "paginate": {
      "first": "Primera",
      "last": "Última",
      "next": "Siguiente",
      "previous": "Anterior"
    },
  },
  "fnDrawCallback": function(oSettings) {
    if(foldersName.length === 0) {
      $("#folderDropdown").prop("disabled", true);
    } else {
      $("#folderDropdown").prop("disabled", false);
      var $div = "";
      for(elem in foldersName) {
        var name = foldersName[elem];
        $div = $div + '<li><a class="alert-pointer" onclick="setFolderInInput(\''+name+'\')">'+name+'</a></li>';
      } /* for */
      $("#foldersOptions").html($div);
    } /* if/else */
  }
}); /* #documentos.DataTable() */

var setFolderInInput = function(name) {
  $("#newDocFolder").val(name);
};

// FileInput Init
//======================================================================
//======================================================================
$("#newDocInput").fileinput({
  uploadAsync: true,
  maxFileCount: 10,
  showUpload: false,
  browseLabel: 'Buscar',
  browseIcon: '',
  removeLabel: 'Remover',
  removeIcon: '',
  uploadLabel: 'Subir',
  uploadIcon: ''
}); /* newDocInput.fileinput */

// Add New File Functions
//======================================================================
//======================================================================
var addNewDocument = function() {
  if(flag) {
    $('#newDocSelect').select2("destroy");
    $('#newDocSelect').html("<option></option>");
  }; /* if */

  try {
    $.ajax({
      type: 'GET',
      url: '/api/users',
      success: function(res) {
        if(res.success) {
          var usersArray = $.map(res.data, function(obj, i) {
            return { id: obj._id, text: obj.local.username, full: obj };
          }); /* $.map() */

          $('#newDocSelect').select2({
            data: usersArray,
            dropdownParent: $("#addDocModal"),
            placeholder: "Usuarios",
            width: "100%"
          }); /* #newDocSelect.select2() */

          flag = true; 
          $("#addDocModal").modal("toggle");
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
}; /* addNewDocument */

$("#sendToAll").on("change", function(e) {
  globalState = !globalState;
  var state = $('#newDocSelect').prop("disabled");
  (state) ? $('#newDocSelect').prop("disabled", false) : $('#newDocSelect').prop("disabled", true);
}); /* #sendToAll.on */

$("#addNewDocBtn").on("click", function(e) {
  $("#addNewDocBtn").prop("disabled", true);
  $("#addNewDocBtn span").html('<i class="fa fa-refresh fa-spin fa-fw"></i>');

  for(var i = 0; i < fileToUpload.length; i++)
    fd.append('document', fileToUpload[i]);

  fd.append('folder', $("#newDocFolder").val());

  if(globalState)
    fd.append('global', true);
  else {
    var userArr = JSON.stringify($("#newDocSelect").val());
    fd.append('userId', userArr);
  } /* if/else */

  try {
    $.ajax({
      type: 'POST',
      url: '/document/upload',
      enctype: 'multipart/form-data',
      data: fd,
      cache: false,
      contentType: false,
      processData: false,
      success: function(res) {
        $("#addNewDocBtn").prop("disabled", false);
        $("#addNewDocBtn span").html('Subir');
        if(res.success) {
          $('#docTable').DataTable().ajax.reload();
          $("#addDocModal").modal("toggle");
          messagerSend("Archivo subido exitosamente", "success");
          $("#addNewDocBtn span").text('Subir');
        } else {
          messagerSend("Error cargando archivo", "error");
        }
      }, /* success */
      error: function(err) {
        $("#addNewDocBtn").prop("disabled", false);
        $("#addNewDocBtn span").html('Subir');
        messagerSend("Error Interno", "error");
      } /* error */
    }); /* ajax */
  } catch(err) {
    $("#addNewDocBtn").prop("disabled", false);
    $("#addNewDocBtn span").html('Subir');
    messagerSend("Error Interno", "error");
  }; /* try/catch */
}); /* addNewDocBtn */

$("#newDocInput").on("change", function(event) {
  $("#addNewDocBtn").prop("disabled", false);
  fileToUpload = [];
  for(var i = 0; i < event.target.files.length; i++)
    fileToUpload.push(event.target.files[i]);
}); /* newDocInput */

$('#newDocInput').on('fileclear', function(event) {
  $("#addNewDocBtn").prop("disabled", true);
  fileToUpload = null;
}); /* newDocInput */

$("#addDocModal").on("hidden.bs.modal", function(e) {
  globalState = false;
  $("#newDocInput").fileinput('clear');
  $("#newDocFolder").val("");
  $("#addNewDocBtn").prop("disabled", true);
  fd.delete('document');
  fd.delete('alias');
  fd.delete('folder');
  try { fd.delete('global'); } catch(err) {};
  try { fd.delete('userId'); } catch(err) {};
  $("#newDocSelect").val(null).change();
  $("#newDocSelect").prop("disabled", false);
  $('#sendToAll').attr('checked', false)
  fileToUpload = null;
}); /* addDocModal */

// Remove File Functions
//======================================================================
//======================================================================
var removeFile = function(idDoc) {
  globalDocId = idDoc;
  try {
    $.ajax({
      type: 'GET',
      url: '/api/adminUploads',
      data: { id: idDoc },
      success: function(res) {
        if(res.success) {
          $("#docToDeleteId").text(res.data[0]._id);
          $("#docToDeleteAlias").text(res.data[0].uploadAlias);
          $("#docToDeleteFolder").text(res.data[0].uploadTo.folder);
          $("#docToDeleteUploadedBy").text(res.data[0].uploadedBy.username);
          $("#docToDeleteUploadedAt").text(moment(res.data[0].uploadedAt).format("DD/MM/YYYY HH:mm:ss"));
          $("#deleteDocModal").modal("toggle");
        } else {
          messagerSend("Error cargando archivo", "error");
        }
      }, /* success */
      error: function(err) {
        messagerSend("Error Interno", "error");
      } /* error */
    }); /* ajax */
  } catch(err) {
    messagerSend("Error Interno", "error");
  }; /* try/catch */
}; /* removeFile */

$("#deleteDocBtn").on("click", function(e) {
  $("#deleteDocBtn").prop("disabled", true);
  $("#deleteDocBtn span").html('<i class="fa fa-refresh fa-spin fa-fw"></i>');
  try {
    $.ajax({
      type: 'DELETE',
      url: '/api/upload',
      data: { id: globalDocId },
      success: function(res) {
        $("#deleteDocBtn").prop("disabled", false);
        $("#deleteDocBtn span").html('Eliminar');
        if(res.success) {
          $('#docTable').DataTable().ajax.reload();
          $("#deleteDocModal").modal("toggle");
          messagerSend("Archivo eliminado exitosamente", "success");
        } else {
          messagerSend("Error eliminando archivo", "error");
        }
      }, /* success */
      error: function(err) {
        $("#deleteDocBtn").prop("disabled", false);
        $("#deleteDocBtn span").html('Eliminar');
        messagerSend("Error Interno", "error");
      } /* error */
    }); /* ajax */
  } catch(err) {
    $("#deleteDocBtn").prop("disabled", false);
    $("#deleteDocBtn span").html('Eliminar');
    messagerSend("Error Interno", "error");
  }; /* try/catch */
}); /* deleteDocBtn */