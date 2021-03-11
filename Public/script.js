window.onload = function() { 
  // socket.io
  var host = window.location.hostname; 
  const socket = io.connect('https://' + host);

  const results = document.querySelector("#results");
  const search = document.querySelector("#searching");

  search.addEventListener("input", function() {
    for (var i = 0; i < results.childNodes.length; i++) {
      results.childNodes[i].parentNode.removeChild(results.childNodes[i]);
    }
    if (!!search.value.length) {
      socket.emit("search", search.value);
    }
  });

  socket.on("retquery", function(list) {
    if (!!list.length) {
      for (var i = 0; i < list.length; i++) {
        var textNode = document.createTextNode(list[i]);
        var a = document.createElement("a");
        var br = document.createElement("br");
        a.appendChild(textNode)
        a.href = "/book/"+list[i].replace(/\s/g, "+")+"/1";
        results.appendChild(a);
        results.appendChild(br);
      }
    }
  });
}