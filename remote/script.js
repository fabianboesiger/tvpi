window.addEventListener("load", function() {
    var subtitles = document.getElementsByTagName("h2");
    for (var i = 0; i < subtitles.length; i++) {
        subtitles[i].addEventListener("click", function() {
            this.nextElementSibling.classList.toggle("show");
            this.classList.toggle("show");
        });
    }
});

function request(url, send, recieve) {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            recieve(JSON.parse(this.responseText));
        }
    };
    request.open("GET", url + "?" + Object
        .keys(send)
        .map(function(key){
        return key+"="+encodeURIComponent(send[key])
        })
        .join("&"), true);
    request.send();
}

function send(action) {
    request("/command", {action: action}, function() {});
}

function volume(value) {
    request("/command", {action: "volume", volume: value}, function() {});
}