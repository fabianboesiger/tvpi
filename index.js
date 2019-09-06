var express = require("express");

var settings = {
    src: "/media/odyssee-im-weltraum/video.mp4",
    paused: true,
    time: 0,
    volume: 1,
    id: 0
}

var tv = express();
tv.use("/media", express.static("media"));
tv.use(express.static("tv"));
tv.get("/recieve", function (req, res) {
    res.json(settings);
});
tv.get("/report", function (req, res) {
    settings.time = parseFloat(req.query.time);
    res.json({success: true});
});
tv.listen(8001);

var remote = express();
remote.use("/media", express.static("media"));
remote.use("/icons", express.static("icons"));
remote.use(express.static("remote"));
remote.get("/", function (req, res) {
    res.redirect("/index.html");
});
remote.get("/command", function(req, res) {
    switch (req.query.action) {
        case "play": {
            settings.paused = !settings.paused;
            break;
        }
        case "advance": {
            settings.time += 10;
            break;
        }
        case "back": {
            settings.time -= 10;
            break;
        }
        case "start": {
            settings.time = 0;
            break;
        }
        case "end": {
            settings.time = 0;
            break;
        }
        case "volume": {
            settings.volume = parseFloat(req.query.volume);
            break;
        }
    }
    settings.id += 1;
    res.json({settings: settings});
});
remote.listen(8000);
