window.addEventListener("load", function() {
    navigate("");
    send("none");
    setInterval(function() {
        // update stuff
        send("none");
    }, 500);
});

function navigate(path) {
    request("/navigate", {path: path}, function(response) {

        var navBack = document.getElementById("nav-back");
        if (response.path.length > 0) {
            var backpath = response.path.substring(0, response.path.length - 1);
            while (backpath.length > 0 && backpath.charAt(backpath.length - 1) !== ",") {
                backpath = backpath.substring(0, backpath.length - 1);
            }
            navBack.firstChild.src = "/icons/arrow-circle-left-solid.svg";
            navBack.setAttribute("onclick", "navigate('" + backpath + "')");
        } else {
            navBack.firstChild.src = "/icons/power-off-solid.svg";
            navBack.setAttribute("onclick", "send('shutdown')");
        }
        
        var navPlay = document.getElementById("nav-play");
        if (response.type === "movie") {
            navPlay.setAttribute("onclick", "source('" + path + "')");
        } else
        if (response.type === "series") {
            navPlay.setAttribute("onclick", "source('" + path + "0,0,')");
        } else {
            navPlay.setAttribute("onclick", "source('')");
        }
        
        document.getElementById("title").innerText = 
            response.title !== undefined ? response.title : "Mediathek";
        document.getElementById("type").innerText = 
            response.type === "series" ? "Serie" :
            response.type === "movie" ? "Film" : "Kollektion";
        document.getElementById("genre").innerText = 
            response.genre !== undefined ? response.genre : "";
        document.getElementById("background").style.backgroundImage = "url('" + response.image + "')";
        var list = document.getElementById("list");
        list.innerHTML = "";
        if (response.list !== undefined) {
            if (response.type === "series") {
                response.list.forEach((e1, i1) => {
                    var divisor = document.createElement("span");
                    divisor.classList.add("series-element");
                    divisor.classList.add("divisor");
                    var number = document.createElement("span");
                    number.classList.add("number");
                    number.innerText = "Staffel " + (i1 + 1);
                    divisor.appendChild(number);
                    list.appendChild(divisor);
                    e1.list.forEach((e2, i2) => {
                        var button = document.createElement("button");
                        button.setAttribute("onclick", "source('" + response.path + i1 + "," + i2 + ",')");
                        button.classList.add("series-element");
                        var title = document.createElement("span");
                        title.classList.add("title");
                        title.innerText = e2.title;
                        var number = document.createElement("span");
                        number.classList.add("number");
                        number.innerText = "Episode " + (i2 + 1);
                        button.appendChild(number);
                        button.appendChild(title);
                        list.appendChild(button);
                    });
                });
            } else {
                response.list.forEach((element, index) => {
                    var button = document.createElement("button");
                    button.setAttribute("onclick", "navigate('" + response.path + index + ",')");
                    button.classList.add("list-element");
                    button.style.backgroundImage = "url('" + element.image + "')";
                    var h2 = document.createElement("h2");
                    h2.innerText = element.title;
                    button.appendChild(h2);
                    list.appendChild(button);
                });
            }
        }
    });
}

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
    request("/command", {action: action}, function(response) {
        update(response);
    });
}

function volume(value) {
    request("/command", {action: "volume", volume: value}, function() {});
}

function source(value) {
    request("/command", {action: "source", path: value}, function(response) {
        update(response);
    });
}

function update(settings) {
    var playButton = document.getElementById("play-button");
    if (settings.paused) {
        playButton.src = "/icons/play-solid.svg";
    } else {
        playButton.src = "/icons/pause-solid.svg";
    }
    document.getElementById("currently-playing").innerText = settings.title;
    document.getElementById("time").innerText = 
        settings.time !== undefined ? convertTime(settings.time) : "";
    document.getElementById("duration").innerText = 
        settings.duration !== undefined ? convertTime(settings.duration) : "";
}

function convertTime(time) {
    var seconds = Math.floor(time % 60);
    var minutes = Math.floor(Math.floor(time/60) % 60);
    var hours = Math.floor(Math.floor(time/60/60));
    
    return addZero(hours) + ":" + addZero(minutes) + ":" + addZero(seconds);
}

function addZero(input) {
    input = input.toString();
    while (input.length < 2) {
        input = "0" + input;
    }
    return input;
}