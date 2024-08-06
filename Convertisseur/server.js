//Initiation des modules
const cp = require("child_process");
const cors = require('cors');
const express = require('express');
const ffmpegStatic = require("ffmpeg-static");
const FluentFfmpeg = require("fluent-ffmpeg");
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const fs = require("fs");
const homoglyphSearch = require('homoglyph-search');
const ytdl = require('@distube/ytdl-core');
const ytpl = require("@distube/ytpl");

FluentFfmpeg.setFfmpegPath(ffmpegPath);

//Initiation du serveur
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const config = require("./config.json");
const PORT = 3000;

app.use(cors());
app.use(express.static('public'));
server.listen(PORT, () => {
    console.log(`Le serveur fonctionne bien ! Rendez-vous sur : http://localhost:3000`);
});

// Fonctions utiles à l'ensemble du programme
async function checkCorrectTitle(name, title) {    
    let correctTitle = false;

    if (name.split(" ").length > 1) {
        name.split(" ").forEach(str => {
            let res = homoglyphSearch.search(title, [str]);
            if (res.length > 0) {
                return correctTitle = true;
            }
        });
    }

    return correctTitle;
}

async function checkFolder() {
    if (!fs.existsSync("../musicDownloaded")) {
        fs.mkdirSync("../musicDownloaded");
    } 

    if (!fs.existsSync("../videoDownloaded")) {
        fs.mkdirSync("../videoDownloaded");
    }
}

function getHoraire(date) {
    let hour = date.getHours();
    let minutes = date.getMinutes();
    if (minutes < 10) minutes = `0${minutes}`;
    return `${hour}h${minutes}`;
}

async function getPlaylistInfos(url, songs) {
    let infos = await ytpl(url, {pages: Infinity});
    
    let numberOfItems = infos.total_items;
    let playlistTitle = infos.title;

    for (const video of infos.items) {
        songs.push(video.shortUrl);
    }

    return {titleOfPlaylist: playlistTitle, numberOfItems: numberOfItems};
}

async function matchTitle(name, title) {
    name = await name.toLowerCase().replace(" - topic", "");
    const results = homoglyphSearch.search(title, [name]);
    let isCorrectTitle = false;

    if (results.length > 0) return title;

    isCorrectTitle = await checkCorrectTitle(name, title);
    return isCorrectTitle === true ? title = title : title = `${name} - ${title}`;
}

async function getTitle(url) {
    const infos = await getVideoInfos(url);
    if (infos.videoRes === "error") return `Video indisponible. (Url : ${infos.videoUrl})`;

    let { title } = infos;
    
    const { artist, name } = (await ytdl.getInfo(url)).videoDetails.author;

    const isTopic = homoglyphSearch.search(name, ["- topic"]);
    
    if (artist) return title = await matchTitle(name, title);

    if (isTopic.length > 0) return title = await matchTitle(name, title);

    return title;
}

async function getVideoInfos(url) {
    
    try {
        const infos = await ytdl.getBasicInfo(url);
        return { title: infos.videoDetails.title.replace(/[<>:;,?"*\/^|>]+/g, ""), videoID: infos.videoDetails.videoId, videoRes: "ok" };
    } catch (error) {
        if (error) {
            console.log(error);
            return { videoUrl: url, videoRes: "error" };
        }
    }
}

function sendStatut(msg, status) {
    io.emit('status', {msg: msg, status: status});
}

function badLink() {
    io.emit('bad_link');
}

async function titleError(title) {
    if (title.indexOf("Video indisponible") !== -1) return true;
}

checkFolder();
let downloadedItems = 0;

// Permet d'afficher la page principale
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
});

// partie du serveur qui gère la version
app.get("/version", async (req, res) => {
    fetch('https://magitivisseur.netlify.app/versions.json', { method: 'GET' })
        .then((response) => response.json())
        .then((json) => {
        res.send({client_version: config.version, version_on_website: json.pc});
    });
});

// Toute cette partie traite du téléchargement
app.get('/download', async (req, res) => {
    let url = req.query.url;
    let isFetch = req.query.fetch;
    let isplaylist = req.query.isplaylist;
    let format = req.query.format;
    let items = [];

    if(!ytdl.validateURL(url) && !ytpl.validateID(url)) { // Permet de valider le lien ou non
        return badLink();
    }

    if (isFetch === "fetch" && isplaylist === undefined) return res.sendStatus(200); 

    //Partie MP3
    async function downloadMP3(url, playlist, numberOfItems) {
        await checkFolder();

        const title = await getTitle(url);
        const videoError = await titleError(title);        

        if (videoError) {
            if (playlist) {
                downloadedItems++;
                console.log(`\x1b[41m${title}. (${downloadedItems}/${numberOfItems})\x1b[0m`);
                return sendStatut(`${title}. (${downloadedItems}/${numberOfItems})`, "error");
            } else {
                console.log(`\x1b[41m${title}\x1b[0m`);
                return sendStatut(`${title}.`, "error");
            }
        }

        console.log(`\x1b[36m${getHoraire(new Date())} : Le téléchargement de "${title}" vient de débuter !\x1b[0m`);
        sendStatut(`${getHoraire(new Date())} : Le téléchargement de "${title}" vient de débuter !`, "start");
        
        const audio = ytdl(url, { filter: 'audioonly', quality: 'highestaudio' });
        let writer = fs.createWriteStream(`../musicDownloaded/${title}.mp3`);

        FluentFfmpeg(audio)
            .audioCodec('libmp3lame')
            .audioBitrate(128)
            .format('mp3')
            .on('error', (err) => console.error(err))
            .pipe(writer, {
                end: true
            });

        writer.on("finish", () => {
            if (playlist) {
                downloadedItems++;
                console.log(`\x1b[32m${getHoraire(new Date())} : "${title}" est téléchargée ! (${downloadedItems}/${numberOfItems})\x1b[0m`);
                sendStatut(`${getHoraire(new Date())} : "${title}" est téléchargée ! (${downloadedItems}/${numberOfItems})`, "finish");
            } else {
                console.log(`\x1b[32m${getHoraire(new Date())} : "${title}" est téléchargée !\x1b[0m`);
                sendStatut(`${getHoraire(new Date())} : "${title}" est téléchargée !`, "finish");
            }
        });
    }

    //Partie MP4
    async function downloadMP4(url, playlist, numberOfItems) {
        await checkFolder();

        let title = await getTitle(url);
        const videoError = await titleError(title);

        if (playlist) {// Il ne peut y avoir 2 fois le même fichier vidéo au même endroit.
            
            if (videoError) {
                downloadedItems++;
                console.log(`\x1b[41m${getHoraire(new Date())} : ${title}. (${downloadedItems}/${numberOfItems})\x1b[0m`);
                return sendStatut(`${getHoraire(new Date())} : "${title}" est téléchargée ! (${downloadedItems}/${numberOfItems})`, "finish");
            }

            if (fs.existsSync(`../videoDownloaded/${title}.mp4`)) {
                downloadedItems++;
                console.log(`\x1b[41m"${title}" existe déjà. Téléchargement impossible. (${downloadedItems}/${numberOfItems})\x1b[0m`);
                return sendStatut(`"${title}" existe déjà. Téléchargement impossible. (${downloadedItems}/${numberOfItems})`, "error");
            }
        } else {
            if (videoError) {
                console.log(`\x1b[41m${title}\x1b[0m`);
                return sendStatut(`"${title}". Téléchargement impossible. (${downloadedItems}/${numberOfItems})`, "error");
            }

            if (fs.existsSync(`../videoDownloaded/${title}.mp4`)) {
                console.log(`\x1b[41m"${title}" existe déjà. Téléchargement impossible.\x1b[0m`);
                return sendStatut(`"${title}" existe déjà. Téléchargement impossible.`, "error");
            }
        }

        console.log(`\x1b[36m${getHoraire(new Date())} : Le téléchargement de "${title}" vient de débuter !\x1b[0m`);
        sendStatut(`${getHoraire(new Date())} : Le téléchargement de "${title}" vient de débuter !`, "start");

        // Quelques données pas spécialement intéressantes sur le poids du fichier
        //const data_weight = { audio: 0, video: 0 };
        const audio = ytdl(url, { filter: 'audioonly', quality: 'highestaudio' });//.on('progress', (_, downloaded, total) => { data_weight.audio = total.toFixed(2);});
        const video = ytdl(url, { filter: 'videoonly', quality: 'highestvideo' });//.on('progress', (_, downloaded, total) => { data_weight.video = total.toFixed(2);});

        // Toute cette partie permet de "mixer" l'audio et la vidéo en un seul fichier
        const ffmpegProcess = cp.spawn(ffmpegStatic, [
            '-loglevel', '8', '-hide_banner',
            '-progress', 'pipe:3',
            '-i', 'pipe:4',
            '-i', 'pipe:5',
            '-map', '0:a',
            '-map', '1:v',
            '-c:v', 'copy',
            `../videoDownloaded/${title}.mp4`,
            ], {
                windowsHide: true,
                stdio: [
                /* Standard: stdin, stdout, stderr */
                'inherit', 'inherit', 'inherit',
                /* Custom: pipe:3, pipe:4, pipe:5 */
                'pipe', 'pipe', 'pipe',
                ],
            }
        );
    
        ffmpegProcess.on('close', () => {
            if (playlist) {
                downloadedItems++;
                console.log(`\x1b[32m${getHoraire(new Date())} : "${title}" est téléchargée ! (${downloadedItems}/${numberOfItems})\x1b[0m`);
                sendStatut(`${getHoraire(new Date())} : "${title}" est téléchargée ! (${downloadedItems}/${numberOfItems})`, "finish");
            } else {
                console.log(`\x1b[32m${getHoraire(new Date())} : "${title}" est téléchargée !\x1b[0m`);
                sendStatut(`${getHoraire(new Date())} : "${title}" est téléchargée !`, "finish");
            }
        });
        
        audio.pipe(ffmpegProcess.stdio[4]);
        video.pipe(ffmpegProcess.stdio[5]);
    }

    //Traitement de toutes les informations (playlist + format de téléchargement)
    if (format === "mp3") {        
        if (isplaylist === "playlist") {
            
            downloadedItems = 0;
            let playlistInfos = await getPlaylistInfos(url, items);

            console.log(`\x1b[44mEn attente de téléchargement de ${playlistInfos.numberOfItems} éléments issus de la playlist "${playlistInfos.titleOfPlaylist}"\x1b[0m`);
            sendStatut(`En attente de téléchargement de ${playlistInfos.numberOfItems} éléments issus de la playlist "${playlistInfos.titleOfPlaylist}"`, "other");
            
            for (const videoID of items) {
                downloadMP3(videoID, true, playlistInfos.numberOfItems);
            } 
        } else {
            downloadMP3(url);
        }
    }

    if (format === "mp4") {
        if (isplaylist === "playlist") {
            downloadedItems = 0;
            let playlistInfos = await getPlaylistInfos(url, items);

            console.log(`\x1b[44mEn attente de téléchargement de ${playlistInfos.numberOfItems} éléments issus de la playlist "${playlistInfos.titleOfPlaylist}"\x1b[0m`);
            sendStatut(`En attente de téléchargement de ${playlistInfos.numberOfItems} éléments issus de la playlist "${playlistInfos.titleOfPlaylist}"`, "other");

            for (const videoID of items) {
                downloadMP4(videoID, true, playlistInfos.numberOfItems);
            }
        } else {
            downloadMP4(url);
        }
    }
});