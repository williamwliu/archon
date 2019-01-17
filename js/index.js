/* Archon Stuff */
var debugContents = undefined;
var debug = undefined;

var numProgress = 0;
var numOk = 0;
var numBad = 0;
var totalProgress = 3;
var totalOk = 3;
var totalBad = 3;

var diff2 = []

function encodeCheck() {
  var fileLength = (debug.a[0] << 24) | (debug.a[1] << 16) | (debug.a[2] << 8) | (debug.a[3]);
  for (var i = 4; i < debug.a.length; ++i) {
    if ((debug.a[i] ^ debug.b[i]) != debug.c[i]) {
      diff2.push(i);
    }
  }
}

function upload() {
  var nameInput = document.getElementById("name-input");
  var name = nameInput.value;
  if (name == undefined || name.length == 0) {
    alert("Need to specify a user name!");
    return;
  }

  var fileInput = document.getElementById("file-input");
  if (fileInput.files == undefined || fileInput.files.length == 0 || fileInput.files[0] == undefined || !fileInput.files[0]) {
    alert("No file chosen to be uploaded!");
    return;
  }

  var file = fileInput.files[0];

  var reader = new FileReader();
  reader.onload = (function(userName, fileName) {
    return function(e) {
      var contents = e.target.result;
      debugContents = new Uint8Array(contents);
      // displayContents(contents);

      debug = encode(contents);

      var archonUrlElem = document.getElementById("archonUrl");
      var archonUrl = "arc://" + userName + ".demo/" + fileName;
      archonUrlElem.innerHTML = archonUrl + " <a href=\"/example?url=" + archonUrl + "\">(example)</a>";
      numProgress = 3;
      var numProgressElem = document.getElementById("numProgress");
      numProgressElem.innerText = numProgress;
      var totalProgressElem = document.getElementById("totalProgress");
      totalProgressElem.innerText = totalProgress;
      var totalOkElem = document.getElementById("totalOk");
      totalOkElem.innerText = totalOk;
      var totalBadElem = document.getElementById("totalBad");
      totalBadElem.innerText = totalBad;
      var uploadStatus = document.getElementById("uploadStatus");
      uploadStatus.style.display = "block";

      uploadToServer(userName, fileName, debug.a, "http://18.219.127.220:8000/upload");
      uploadToServer(userName, fileName, debug.b, "http://18.224.199.90:8000/upload");
      uploadToServer(userName, fileName, debug.c, "http://18.224.213.113:8000/upload");
    };
  })(nameInput.value, file.name);
  reader.readAsArrayBuffer(file);
}

function encode(contentArrayBuffer) {
  var fileLength = contentArrayBuffer.byteLength;
  var blockLength = (fileLength + 1) >> 1;

  var contentView = new Uint8Array(contentArrayBuffer);

  if (fileLength < 0) {
    alert("error: file size is negative");
  }
  if (fileLength > 2147483647) {
    alert("error: file too large.");
  }

  var fileLength1 = fileLength >> 24;
  var fileLength2 = (fileLength << 8) >> 24;
  var fileLength3 = (fileLength << 16) >> 24;
  var fileLength4 = (fileLength << 24) >> 24;
  var a = new Uint8Array(blockLength + 4);
  a[0] = fileLength1;
  a[1] = fileLength2;
  a[2] = fileLength3;
  a[3] = fileLength4;
  for (var i = 0; i < blockLength; i++) {
    a[i + 4] = contentView[i];
  }
  var b = new Uint8Array(blockLength + 4);
  b[0] = fileLength1;
  b[1] = fileLength2;
  b[2] = fileLength3;
  b[3] = fileLength4;
  for (var i = blockLength; i < fileLength; i++) {
    b[i - blockLength + 4] = contentView[i];
  }
  var c = new Uint8Array(blockLength + 4);
  c[0] = fileLength1;
  c[1] = fileLength2;
  c[2] = fileLength3;
  c[3] = fileLength4;
  for (var i = 0; i < blockLength; i++) {
    c[i + 4] = a[i + 4] ^ b[i + 4];
  }

  return {
    contentView: contentView,
    fileLength: fileLength,
    blockLength: blockLength,
    a: a,
    b: b,
    c: c
  };
};

uploadToServer = function(username, filename, content, serverUrl) {
  var fd = new FormData();
  fd.append(username, new Blob([content], {
    type: "application/octet-stream"
  }), filename);
  var xhr = new XMLHttpRequest();
  xhr.open("POST", serverUrl);

  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      numProgress = numProgress - 1;
      var numProgressElem = document.getElementById("numProgress");
      numProgressElem.innerText = numProgress;

      if (xhr.status == 200) {
        numOk = numOk + 1;
        var numOkElem = document.getElementById("numOk");
        numOkElem.innerText = numOk;
      } else {
        numBad = numBad + 1;
        var numBadElem = document.getElementById("numBad");
        numBadElem.innerText = numBad;
      }
    }
  };

  /*
  xhr.onload = function(oEvent) {
  if (oReq.status == 200) {
    alert("success");
  } else {
    alert("Error " + oReq.status + " occurred when trying to upload your file.");
  }
  };
  */
  xhr.send(fd);
}
/* Add and Remove Image buttons */
function readURL(input) {
  if (input.files && input.files[0]) {
    var reader = new FileReader();
    reader.onload = function(e) {
      $('.image-upload-wrap').hide();
      $('.file-upload-image').attr('src', e.target.result);
      $('.file-upload-content').show();
      $('.image-title').html(input.files[0].name);
    };
    reader.readAsDataURL(input.files[0]);
  } else {
    removeUpload();
  }
}

function removeUpload() {
  $('.file-upload-input').replaceWith($('.file-upload-input').clone());
  $('.file-upload-content').hide();
  $('.image-upload-wrap').show();
}

$('.image-upload-wrap').bind('dragover', function() {
  $('.image-upload-wrap').addClass('image-dropping');
});
$('.image-upload-wrap').bind('dragleave', function() {
  $('.image-upload-wrap').removeClass('image-dropping');
});

// Get the current year for the copyright
$('#year').text(new Date().getFullYear());
// Init Scrollspy
$('body').scrollspy({
  target: '#main-nav'
});
// Smooth Scrolling
$("#main-nav a").on('click', function(event) {
  if (this.hash !== "") {
    event.preventDefault();
    const hash = this.hash;
    $('html, body').animate({
      scrollTop: $(hash).offset().top
    }, 800, function() {
      window.location.hash = hash;
    });
  }
});


//Contact
$('#contact-form').bootstrapValidator({
  //        live: 'disabled',
          message: 'This value is not valid',
          feedbackIcons: {
              valid: 'glyphicon glyphicon-ok',
              invalid: 'glyphicon glyphicon-remove',
              validating: 'glyphicon glyphicon-refresh'
          },
          fields: {
              Name: {
                  validators: {
                      notEmpty: {
                          message: 'The Name is required and cannot be empty'
                      }
                  }
              },
              email: {
                  validators: {
                      notEmpty: {
                          message: 'The email address is required'
                      },
                      emailAddress: {
                          message: 'The email address is not valid'
                      }
                  }
              },
              Message: {
                  validators: {
                      notEmpty: {
                          message: 'The Message is required and cannot be empty'
                      }
                  }
              }
          }
      });