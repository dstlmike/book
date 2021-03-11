window.onload = function() {
  var page = 1;
  const err = document.querySelector("#err");
  const pages = document.querySelector(".pages");
  const newpage = document.querySelector("#newpage");
  const delpage = document.querySelector("#deletepage");
  const publish = document.querySelector("#publish");

  // socket.io
  var host = window.location.hostname; 
  const socket = io.connect('https://' + host);

  newpage.addEventListener("click", function() {
    page++;
    err.style.display = "none";
    err.innerHTML = "";
    var br = document.createElement("BR");
    var pageNode = document.createTextNode(`Page ${page}`);
    var h3 = document.createElement("h3");
    var textarea = document.createElement("textarea");
    var div = document.createElement("div");
    // div
    div.id = `page${page}`;
    // br
    div.appendChild(br);
    br = document.createElement("BR");
    div.appendChild(br);
    // h3
    h3.appendChild(pageNode);
    div.appendChild(h3);
    // br
    br = document.createElement("BR");
    div.appendChild(br);
    // textarea
    textarea.placeholder = "Type here...";
    textarea.id = `page${page}t`
    div.appendChild(textarea);
    // div
    pages.appendChild(div);
    document.getElementById(`page${page}`).scrollIntoView();
  });

  delpage.addEventListener("click", function() {
    if (page >= 2) {
      var pagediv = document.querySelector(`#page${page}`);
      pagediv.parentNode.removeChild(pagediv);
      page--;
    } else {
      err.style.display = "inline-block";
      err.innerHTML = "Error 001 (Page1Error): Attempting to delete the first page.";
    }
  });

  publish.addEventListener("click", function() {
    var title = document.querySelector("#title").value;
    var blank = false;

    for (var i = 0; i < page; i++) {
      var selpage = page-i;
      var element = document.querySelector(`#page${selpage}t`)

      if (element.value == "") {
        blank = true;
      }
    }

    if (document.querySelector("#restriction").value !== "same") {
      if (blank) {
        err.style.display = "inline-block";
        err.innerHTML = "Error 002 (BlankError): 1 page or more is completely blank. Please review your book.";
      } else {
        if (title == "") {
          err.style.display = "inline-block";
          err.innerHTML = "Error 002 (BlankError): The title is blank.";
        } else if (title.toLowerCase() === "books") {
          err.style.display = "inline-block";
          err.innerHTML = "Error 004 (JSONLockerError): The title is named 'Books' (or any other variation of 'books')."
        } else {
          // socket.emit('mkdir', {name: title});
          var ntitle = title.replace(/\s/g, '+');
          socket.emit("checkbook", ntitle)
        }
      }
    } else {
      err.style.display = "inline-block";
      err.innerHTML = "Error 003 (RestrictionError): Please set a restriction.";
    }
  });

  socket.on("checkbookret", function(bool) {
    var title = document.querySelector("#title").value;
    if (bool) {
      var ntitle = title.replace(/\s/g, '+');
      console.log(title);
      socket.emit('setbook', {title: ntitle, rtitle: title});
      for (i = 0; i < page; i++) {
        selpage = i+1;
        element = document.querySelector(`#page${selpage}t`);

        // socket.emit('createfile', {location: './books/'+title+'/'+page.toString()+'.txt', data: element.value});
        socket.emit('addpage', {title: ntitle, page: element.value});
      }
      // socket.emit('createfile', {location: './books/'+title+'/restriction.txt', data: document.querySelector("#restriction").value});
      socket.emit('setres', {title: ntitle, res: document.querySelector("#restriction").value});
      window.location = '/book/'+ntitle+'/1';
    } else {
      err.style.display = "inline-block";
      err.innerHTML = "Error 004 (JSONLockerError): The title has already been taken.";
    }
  });
}