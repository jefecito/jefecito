// Global Variable
//======================================================================
var userID;

// Open/Close Sidebar
//======================================================================
$("#openSideMenu").on("click", function(e) {
  $("#sidebar").toggleClass("open");
});

// Sets Active Tab in Sidebar
//======================================================================
var currentLocation = window.location.pathname;
switch(currentLocation) {
  case "/user":
    $("#user-panel").addClass("active");
    break;
  case "/user/config":
    $("#user-config").addClass("active");
    break;
  default:
    console.log("default");
    break;
};

// Sidebar User Status
//======================================================================
var getUserSidebar = function() {
  try {
    $.ajax({
      type: 'POST',
      url: '/user',
      success: function(res) {
        if(res.success) {
          d = new Date();
          $("#sidebar-avatar").attr("src", res.data.local.avatar+"?"+d.getTime());
          $("#sidebar-user").text(res.data.local.username);
          $("#sidebar-role").text(res.data.local.roles[0]);
          userID = res.data._id;
        } else {
          messagerSend('Error cargando informacion de usuario', 'error');
        }
      },
      error: function(err) {
        messagerSend('Error Interno', 'error');
        console.log("err >>> ", err);
      },
    });
  } catch(err) {
    messagerSend('Error Interno', 'error');
    console.log("err >>> ", err);
  }
}; /* getUserSidebar */

getUserSidebar();