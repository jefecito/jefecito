var loadingHtml = '<div class="card">'+
                    '<div class="card-content text-center">'+
                      '<i class="fa fa-refresh fa-spin fa-fw"></i> Cargando archivos...'+
                    '</div> <!-- /.card-content -->'+
                  '</div> <!-- /.card -->';

var infoHtml = '<div class="alert alert-info text-center">'+
                  '<strong>No hay archivos cargados.</strong>'+
               '</div> <!-- /.alert-info -->';

var selectHtml = '<div class="alert alert-info text-center">'+
                    '<strong>Seleccione una carpeta.</strong>'+
                  '</div> <!-- /.alert-info -->';

var errorHtml = '<div class="alert alert-danger text-center">'+
                  '<strong>Error cargando archivos:</strong> <span onClick="reloadFiles()" class="retry">Intentelo otra vez.</span>'+
                '</div> <!-- /.alert-info -->';

var docHtml    = '<div class="row">';
var tree       = {};
var treeLength = 0;

var generateTree = function() {
  if(treeLength > 0) {
    var folderNames = [];
    var $divs = '<div class="row">'+
                  '<div class="col-sm-4">'+
                    '<div class="card">'+
                      '<div class="card-header">'+
                        '<h5 class="title">Carpetas</h5>'+
                      '</div> <!-- /.card-header -->'+
                      '<div class="card-content">';

    for(elem in tree) {
      var size = tree[elem].length;
      $divs = $divs + '<div class="folder-inner">'+
                        '<div onClick="loadDocs(\''+elem+'\')">'+
                          '<img src="/img/tree/directory.png">'+
                          '<span>'+elem+' ('+size+')</span>'+
                        '</div>'+
                      '</div>';
    }

    $divs = $divs + '</div> <!-- /.card-content -->'+
                  '</div> <!-- /.card -->'+
                '</div> <!-- /.col-sm-4 -->'+
                '<div class="col-sm-8">'+
                  '<div id="folders"></div>'+
                '</div> <!-- /.col-sm-8 -->'+
              '</div> <!-- /.row -->';

    $("#filesToDownload").html($divs);
    $("#folders").html(selectHtml);
  } else {
    $("#filesToDownload").html(infoHtml);
  }
}; /* generateTree() */

var reloadFilesFromUser = function() {
  try {
    $.ajax({
      type: 'GET',
      url: '/userDocuments',
      success: function(res) {
        if(res.success) {
          if(res.data.length > 0) {
            treeLength++;
            var files = res.data, i;
            for(i = 0; i < files.length; i++) {
              var file = files[i];
              var o_file = {};
              o_file.date  = moment(file.uploadedAt).format("DD/MM/YYYY HH:mm:ss");
              o_file.size  = (file.uploadSize / 1024).toFixed(2);
              o_file.extn  = file.uploadName.substr(file.uploadName.indexOf(".") + 1);
              o_file.alias = file.uploadAlias;
              o_file.autor = file.uploadedBy.username;
              o_file._id   = file._id;
              if(tree[file.uploadTo.folder] === undefined) {
                tree[file.uploadTo.folder] = [];
                tree[file.uploadTo.folder].push(o_file);
              } else {
                tree[file.uploadTo.folder].push(o_file);
              } /* if/else */
            } /* for */
          } /* if() */
          generateTree();
        } else {
          messagerSend('Error documentos del usuario', 'error');
          $("#filesToDownload").html(errorHtml);
        } /* if/else */
      }, /* success */
      error: function(err) {
        messagerSend('Error Interno', 'error');
        $("#filesToDownload").html(errorHtml);
      } /* error */
    }); /* ajax */
  } catch(err) {
    messagerSend('Error Interno', 'error');
    $("#filesToDownload").html(errorHtml);
  } /* try/catch */
}; /* reloadFilesFromUser */

var reloadFiles = function() {
  $("#filesToDownload").html(loadingHtml);

  try {
    $.ajax({
      type: 'GET',
      url: '/api/uploads',
      success: function(res) {
        if(res.success) {
          if(res.data.length > 0) {
            treeLength++;
            var files = res.data, i;
            for(i = 0; i < files.length; i++) {
              var file = files[i];
              var o_file = {};
              o_file.date  = moment(file.uploadedAt).format("DD/MM/YYYY HH:mm:ss");
              o_file.size  = (file.uploadSize / 1024).toFixed(2);
              o_file.extn  = file.uploadName.substr(file.uploadName.indexOf(".") + 1);
              o_file.alias = file.uploadAlias;
              o_file.autor = file.uploadedBy.username;
              o_file._id   = file._id;
              if(tree[file.uploadTo.folder] === undefined) {
                tree[file.uploadTo.folder] = [];
                tree[file.uploadTo.folder].push(o_file);
              } else {
                tree[file.uploadTo.folder].push(o_file);
              } /* if/else */
            } /* for */
          } /* if() */
          reloadFilesFromUser();
        } else {
          messagerSend("Error cargando archivo", "error");
          reloadFilesFromUser();
          $("#filesToDownload").html(errorHtml);
        } /* if/else */
      }, /* success */
      error: function(err) {
        messagerSend("Error Interno", "error");
        reloadFilesFromUser();
        $("#filesToDownload").html(errorHtml);
      } /* error */
    }); /* ajax */
  } catch(err) {
    console.log("err >>> ", err);
    messagerSend("Error Interno", "error");
    reloadFilesFromUser();
    $("#filesToDownload").html(errorHtml);
  }; /* try/catch */
}; /* reloadFiles */

var loadDocs = function(folder) {
  $("#folders").html(loadingHtml);
  var arrFiles = tree[folder];
  var docHtml = '<div class="row">'+
                  '<div class="col-sm-12">'+
                    '<div class="card animated fadeIn">'+
                      '<div class="card-header">'+
                        '<h5 class="title"><img src="/img/tree/directory.png">'+folder+'</h5>'+
                      '</div> <!-- /.card-header -->'+
                    '</div> <!-- /.card -->'+
                  '</div> <!-- /.col-sm-12 -->';

  if(arrFiles.length === 0) {
    $("#folders").html(infoHtml);
    return;
  } /* if */

  for(i = 0; i < arrFiles.length; i++) {
    var file = arrFiles[i];
    docHtml +=  '<div class="col-sm-6">'+
                  '<div class="card animated fadeIn">'+
                    '<div class="card-header">'+
                      '<h5 class="title">'+file.alias+'</h5>'+
                    '</div> <!-- /.card-header -->'+
                    '<div class="card-content">'+
                      '<p class="doc-subtitle">Autor: '+file.autor+'</p>'+
                      '<p>Archivo <span class="extension-span">'+file.extn+'</span></p>'+
                      '<p>Subido el '+file.date+'</p>'+
                      '<p>Tamaño del archivo: '+file.size+' KB</p>'+
                    '</div> <!-- /.card-content -->'+
                    '<div class="card-action to-right">'+
                      '<a href="/file/download/'+file._id+'" class="right-btn">Descargar</a>'+
                    '</div> <!-- /.card-action -->'+
                  '</div> <!-- /.card -->'+
                '</div> <!-- /.col-sm-6 -->';
  } /* for() */
  docHtml += '</div> <!-- /.row -->';
  $("#folders").html(docHtml);
}; /* loadDocs() */

reloadFiles();