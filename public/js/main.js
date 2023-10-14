function flash(type, message) {
    if (type === "success") {
      let flash = `<div id="flash-message" class="alert alert-${type} col-lg-6 col-md-12 shadow w-50 mx-auto fixed-top mt-5 alert-dismissible flash-message"
        style="border-left:#155724 5px solid; border-radius: 0px">
        <button class="btn-close" data-bs-dismiss="alert"></button>
                <i class="bi bi-shield-fill-check"></i> ${message}
            </div>`
      $('body').append(flash);
    } else if (type === "danger") {
      let flash = `<div id="flash-message" class="alert alert-${type} col-lg-6 col-md-12 shadow w-50 mx-auto fixed-top mt-5 alert-dismissible flash-message"
                        style="border-left:#721C24 5px solid; border-radius: 0px">
                <button class="btn-close" data-bs-dismiss="alert"></button>
                <i class="bi bi-exclamation-circle-fill"></i> ${message}
            </div>`
      $('body').append(flash);
    } else {
      let flash = `<div id="flash-message" class="alert alert-${type} col-lg-6 col-md-12 shadow w-50 mx-auto fixed-top mt-5 alert-dismissible flash-message"
        style="border-left:#856404 5px solid;  border-radius: 0px">
                <button class="btn-close" data-bs-dismiss="alert"></button>
                <i class="bi bi-cone-striped"></i> ${message}
            </div>`
      $('body').append(flash);
    }
    $('#flash-message').delay(5000).fadeOut();
    $('.flash-message').delay(5000).fadeOut();
  }
  //page loader
$(window).on('load', function () {
    setTimeout(function () {
      $('.preloader').fadeOut('slow');
    }, 700);
  });
  
  window.addEventListener(
    'online', function () {
      flash('success', '<i class="bi bi-wifi ms-3 me-1"></i> Your internet connection was restored.')
    }
  );
window.addEventListener(
    'offline', function (){
      flash('danger', '<i class="bi bi-wifi-off ms-3 me-1"></i> You are currently offline. <span style="cursor:pointer; color:#4154f1;" onclick="location.reload();">Refresh</span>')
    }
  );

  