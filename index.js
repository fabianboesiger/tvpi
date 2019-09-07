var express = require("express");
var path = require("path");
var fs = require("fs");
var exec = require('child_process').exec;

function shutdown(){
    exec('sudo shutdown now', function(error, stdout, stderr){});
}

function glob(filepath, inherited) {
    var datapath = path.join(filepath, "data.json");
    var data = fs.existsSync(datapath) 
        ? JSON.parse(fs.readFileSync(datapath))
        : {type: "collection"};
    
    var imagepathJPG = path.join(filepath, "wallpaper.jpg");
    var imagepathPNG = path.join(filepath, "wallpaper.png");
    data.image = fs.existsSync(imagepathJPG)
        ? imagepathJPG.substring(imagepathJPG.indexOf("tvpi") + 4)
        : fs.existsSync(imagepathPNG)
        ? imagepathPNG.substring(imagepathPNG.indexOf("tvpi") + 4)
        : undefined;
    if (data.image !== undefined) data.image = data.image.replace(/\\/g, "/");
    
    var imagepathMP4 = path.join(filepath, "video.mp4");
    data.video = fs.existsSync(imagepathMP4)
        ? imagepathMP4.substring(imagepathMP4.indexOf("tvpi") + 4)
        : undefined;
    if (data.video !== undefined) data.video = data.video.replace(/\\/g, "/");
    
    if (data.genre === undefined && inherited.genre !== undefined) data.genre = inherited.genre; 
    if (data.image === undefined && inherited.image !== undefined) data.image = inherited.image; 

    if (data.type === "movie") {
        return {
            type: data.type,
            title: data.title,
            genre: data.genre,
            image: data.image,
            video: data.video,
            description: data.description
        };
    } else {
        var list = [];
        var files = fs.readdirSync(filepath);
        files.sort();
        files.forEach(function(file) {
            if (file.includes(".")) return;
            list.push(glob(path.join(filepath, file), data));
        });
        return {
            type: data.type,
            title: data.title,
            genre: data.genre,
            image: data.image,
            list: list,
            description: data.description
        };
    }
}

var media = glob(path.join(__dirname, "media"), {});

var settings = {
    src: "",
    title: "Keine Wiedergabe",
    path: "",
    paused: true,
    time: 0,
    duration: 0,
    volume: 1,
    id: 0
};

var tv = express();
tv.use("/media", express.static(path.join(__dirname, "media")));
tv.use(express.static(path.join(__dirname, "tv")));
tv.get("/recieve", function (req, res) {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.json(settings);
});
tv.get("/report", function (req, res) {
    settings.time = parseFloat(req.query.time);
    settings.duration = parseFloat(req.query.duration);
    if (req.query.ended === "true") {
        var current = getMedia(settings.path);
        var trimmed = settings.path.substring(0, settings.path.length - 1);
        var splitted = trimmed.split(",");
        var root = "";
        for (var i = 0; i < splitted.length - 2; i++) {
            root += splitted[i] + ",";
        }
        var rootMedia = getMedia(root);
        if (rootMedia.type === "series") {
            var next = "";
            for (var i = 0; i < splitted.length - 1; i++) {
                next += splitted[i] + ",";
            }
            next += (parseInt(splitted[splitted.length - 1]) + 1) + ",";
            var nextEpisode = getMedia(next);
            if (nextEpisode === undefined) {
                next = "";
                for (var i = 0; i < splitted.length - 2; i++) {
                    next += splitted[i] + ",";
                }
                next += (parseInt(splitted[splitted.length - 2]) + 1) + ",0,";
                var nextEpisode = getMedia(next);
            }
            if (nextEpisode !== undefined && nextEpisode.video !== undefined) {
                settings.src = nextEpisode.video;
                settings.title = nextEpisode.title;
                settings.path = next;
                settings.time = 0;
                settings.paused = false;
                settings.id += 1;
            }
        }
    }
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.json({success: true});
});
tv.listen(8001);

function getMedia(path) { 
    var edited = media;
    var splitted = path.split(",");
    for (var i = 0; i < splitted.length - 1; i++) {
        if (edited.list === undefined) {
            return undefined;
        }
        edited = edited.list[splitted[i]];
        if (edited === undefined) {
            return undefined;
        }
    }
    edited.path = path;
    return edited;
}

var remote = express();
remote.use("/media", express.static(path.join(__dirname, "media")));
remote.use("/icons", express.static(path.join(__dirname, "icons")));
remote.use(express.static(path.join(__dirname, "remote")));
remote.get("/", function (req, res) {
    res.redirect("/index.html");
});
remote.get("/navigate", function (req, res) {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.json(getMedia(req.query.path));
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
            settings.time = 100000;
            break;
        }
        case "volume": {
            settings.volume = parseFloat(req.query.volume);
            break;
        }
        case "source": {
            var selected = getMedia(req.query.path);
            if (selected !== undefined && selected.video !== undefined) {
                settings.src = selected.video;
                settings.title = selected.title;
                settings.path = req.query.path;
                settings.time = 0;
                settings.paused = false;
            }
            break;
        }
        case "shutdown": {
            shutdown();
            break;
        }
    }
    if (req.query.action !== "none") {
        settings.id += 1;
    }
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.json(settings);
});


remote.listen(8000);
