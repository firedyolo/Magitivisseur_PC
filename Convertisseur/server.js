const express = require('express');
const cors = require('cors');
const ytdl = require('ytdl-core');
const ytpl = require("ytpl");
const fs = require("fs");
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.static('public'));
app.listen(PORT, () => {
    console.log(`Le serveur fonctionne bien ! Rendez-vous sur : http://localhost:3000`);
});

function getDay(date) {
    return date.toLocaleDateString("fr-FR", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'});
}

function getHoraire(date) {
    let hour = date.getHours();
    let minutes = date.getMinutes();
    if (minutes < 10) minutes = `0${minutes}`;
    return `${hour}h${minutes}`;
}

async function checkFolder() {
    if (!fs.existsSync("../musicDownloaded")) {
        fs.mkdirSync("../musicDownloaded");
    } else {
        console.log("C'est bon niveau dossier");
    }
}

let serverDate = new Date();
checkFolder();

app.get('/', async function(req, res) {

    res.render("./index.ejs", {
        root: __dirname,
        sessionDate: getDay(serverDate),
        heure: getHoraire(serverDate),
    });
});

app.get('/download', async (req, res) => {
    let url = req.query.url;
    let isFetch = req.query.fetch;
    let isplaylist = req.query.islistplay;
    let titleOfPlaylist = [];

    if(!ytdl.validateURL(url) && !ytpl.validateID(url)) {
        return res.sendStatus(400);
    }

    if (isFetch === "fetch" && isplaylist === undefined) return res.sendStatus(200);

    // Partie pas playlist
    async function getVideoInfos(url) {
        let infos = await ytdl.getBasicInfo(url);
        return {title: infos.videoDetails.title.replace(/[^\w\s]/g, ''), author: infos.videoDetails.author.name}
    }

    async function getTitle(url) {
        let infos = await ytdl.getBasicInfo(url);
        return infos.videoDetails.title.replace(/[^\w\s]/g, '');
    }

    async function download(url) {
        await checkFolder();

        let videoInfos = await getVideoInfos(url);
        let title = videoInfos.title;
        console.log(`\x1b[36m${getHoraire(new Date())} : Le téléchargement de ${title} vient de débuter !`);
        
        let writer = fs.createWriteStream(`../musicDownloaded/${title}.mp3`);
        ytdl(url, {
            format: 'mp3',
            filter: 'audioonly',
        }).pipe(writer);

        writer.on("finish", () => {
            console.log(`\x1b[32m${getHoraire(new Date())} : "${title}" est téléchargée !`);
        });
    }

    /* Partie Playlist */

    async function downloadPlaylist(url, title, playlistTitle, numberOfSongs, downloadedSongs) {
        let writer = fs.createWriteStream(`../musicDownloaded/${title}.mp3`);
        console.log(`\x1b[36m${getHoraire(new Date())} : Le téléchargement de ${title} vient de débuter !`);
    
        ytdl(url, {
            format: 'mp3',
            filter: 'audioonly',
        }).pipe(writer);
    
        writer.on("finish", () => {
            console.log(`\x1b[32m${getHoraire(new Date())} : Le téléchargement de ${title} est fini ! (${downloadedSongs}/${numberOfSongs})`);
        });
    }

    async function getPlaylistInfos(url) {
        let infos = await ytpl(url, {pages: Infinity});
        let numberOfSongs = infos.estimatedItemCount;
        let playlistTitle = infos.title;
    
        for (const video of infos.items) {
            titleOfPlaylist.push(video.id);
        }
    
        return {titleOfPlaylist: playlistTitle, numberOfSongs: numberOfSongs};
    }

    //Exécution de la playlist ou pas
    if (isplaylist === "listplay") {
        let playlistInfos = await getPlaylistInfos(url);
        let downloadedSongs = 0;
        console.log(`\x1b[44mEn attente de téléchargement de ${playlistInfos.numberOfSongs} éléments issus de la playlist "${playlistInfos.titleOfPlaylist}"\x1b[0m`);
        for (const videoID of titleOfPlaylist) {
            let title = await getTitle(videoID);
            downloadedSongs++;
            downloadPlaylist(videoID, title, playlistInfos.titleOfPlaylist, playlistInfos.numberOfSongs, downloadedSongs);
        } 
    } else {
        download(url);
    }
});