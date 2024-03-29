window.addEventListener("load", function() {
    var video = document.getElementsByTagName("video")[0];
    enableFullscreen(video);

    var id = -1;

    // every second ...
    setInterval(function() {
        // get response
        request("/recieve", {}, function(settings) {
            if(id !== settings.id) {
                id = settings.id;
                if (!video.src.includes(settings.src)) {
                    video.src = settings.src;
                }
                video.currentTime = settings.time;
                if (settings.paused === true) {
                    video.pause();
                } else {
                    video.play();
                }
                video.volume = settings.volume;
            }

            
            // report back
            request("/report", {
                time: video.currentTime,
                duration: video.duration,
                ended: video.ended
            }, function() {});
        });
    }, 500);
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

function enableFullscreen(element) {
    if(element.requestFullscreen)
        element.requestFullscreen();
    else if(element.mozRequestFullScreen)
        element.mozRequestFullScreen();
    else if(element.webkitRequestFullscreen)
        element.webkitRequestFullscreen();
    else if(element.msRequestFullscreen)
        element.msRequestFullscreen();
}