window.onload = function() {
  var host = window.location.hostname;
  const socket = io.connect('https://'+host);

  console.log(window.location.href)

  socket.emit('grabdata', {
    title: window.location.href.split('/')[4],
    page: parseInt(window.location.href.split('/')[5])
  });

  socket.on('senddata', function(data) {
    var title = document.querySelector("#title");
    var content = document.querySelector("#content");
    var page = document.querySelector("#page");
    var next = document.querySelector(".next");
    var prev = document.querySelector(".prev");

    data.content = data.content.replace('\n', '<br>');

    if (parseInt(window.location.href.split('/')[5]) % 2 == 0) {
      page.style.float = "right";
    } else {
      page.style.float = "left";
    }
    console.log(data.prev)
    if (data.next) {
      next.addEventListener("click", function() {
        window.location = '/book/'+title.innerHTML.replace(/\s/g, '+')+'/'+(parseInt(window.location.href.split('/')[5])+1).toString();
      });
    } else {
      next.style.display = 'none';
    }

    if (data.prev) {
      prev.addEventListener("click", function() {
        window.location = '/book/'+title.innerHTML.replace(/\s/g, '+')+'/'+(parseInt(window.location.href.split('/')[5])-1).toString();
      });
    } else {
      prev.style.display = 'none';
    }

    content.innerHTML = data.content;
    title.innerHTML = data.title;
    page.innerHTML = window.location.href.split('/')[5];
  });
}