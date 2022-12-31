const express = require('express');
const cors = require('cors');
const ytdl = require('ytdl-core');
const ytpl = require("ytpl");
const fs = require("fs");
const cp = require("child_process");
const ffmpeg = require("ffmpeg-static");
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
    } 

    if (!fs.existsSync("../videoDownloaded")) {
        fs.mkdirSync("../videoDownloaded");
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
    let isplaylist = req.query.isplaylist;
    let format = req.query.format;
    let titleOfPlaylist = [];

    if(!ytdl.validateURL(url) && !ytpl.validateID(url)) {
        return res.sendStatus(400);
    }

    if (isFetch === "fetch" && isplaylist === undefined) return res.sendStatus(200);

    // Fonctions "universelles"
    async function getVideoInfos(url) {
        let infos = await ytdl.getBasicInfo(url);
        return {title: infos.videoDetails.title.replace(/[^\w\s]/g, ''), author: infos.videoDetails.author.name}
    }

    async function getTitle(url) {
        let infos = await ytdl.getBasicInfo(url);
        return infos.videoDetails.title.replace(/[^\w\s]/g, '');
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

    //Partie MP3
    async function downloadMP3(url) {
        await checkFolder();

        let videoInfos = await getVideoInfos(url);
        let title = videoInfos.title;
        console.log(`\x1b[36m${getHoraire(new Date())} : Le téléchargement de "${title}" vient de débuter !\x1b[0m`);
        
        let writer = fs.createWriteStream(`../musicDownloaded/${title}.mp3`);
        ytdl(url, {
            format: 'mp3',
            filter: 'audioonly',
        }).pipe(writer);

        writer.on("finish", () => {
            console.log(`\x1b[32m${getHoraire(new Date())} : "${title}" est téléchargée !\x1b[0m`);
        });
    }

    async function downloadPlaylistMP3(url, title, numberOfSongs, downloadedSongs) {
        let writer = fs.createWriteStream(`../musicDownloaded/${title}.mp3`);
        console.log(`\x1b[36m${getHoraire(new Date())} : Le téléchargement de "${title}" vient de débuter !\x1b[0m`);
    
        ytdl(url, {
            format: 'mp3',
            filter: 'audioonly',
        }).pipe(writer);
    
        writer.on("finish", () => {
            console.log(`\x1b[32m${getHoraire(new Date())} : Le téléchargement de "${title}" est fini ! (${downloadedSongs}/${numberOfSongs})\x1b[0m`);
        });
    }

    //Partie MP4
    async function downloadMP4(url, playlist, numberOfVideos, downloadedVideos) {
        await checkFolder();

        let title = await getTitle(url);

        if (playlist === "playlist") {
            if (fs.existsSync(`../videoDownloaded/${title}.mp4`)) {
                return console.log(`\x1b[41m"${title}" existe déjà. Téléchargement impossible. (${downloadedVideos}/${numberOfVideos})\x1b[0m`);
            }
        } else {
            if (fs.existsSync(`../videoDownloaded/${title}.mp4`)) {
                return console.log(`\x1b[41m"${title}" existe déjà. Téléchargement impossible.\x1b[0m`);
            }
        }      

        console.log(`\x1b[36m${getHoraire(new Date())} : Le téléchargement de "${title}" vient de débuter !\x1b[0m`);

        const data_weight = { audio: 0, video: 0 };
        const audio = ytdl(url, { filter: 'audioonly', quality: 'highestaudio' }).on('progress', (_, downloaded, total) => {
            data_weight.audio = total.toFixed(2);
        });
        const video = ytdl(url, { filter: 'videoonly', quality: 'highestvideo' }).on('progress', (_, downloaded, total) => {
            data_weight.video = total.toFixed(2);
        });

        const ffmpegProcess = cp.spawn(ffmpeg, [
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
            const weight_total = Number(data_weight.audio) + Number(data_weight.video);
            if (playlist === "playlist") {
                console.log(`\x1b[32m${getHoraire(new Date())} : "${title}" est téléchargée ! (poids estimé : ${weight_total}MB) (${downloadedVideos}/${numberOfVideos})\x1b[0m`);
            } else {
                console.log(`\x1b[32m${getHoraire(new Date())} : "${title}" est téléchargée ! (poids estimé : ${weight_total}MB)\x1b[0m`);
            }
        });
        
        audio.pipe(ffmpegProcess.stdio[4]);
        video.pipe(ffmpegProcess.stdio[5]);
    }

    //Traitement de toutes les informations (playlist + format de téléchargement)
    if (format === "mp3") {
        if (isplaylist === "playlist") {
            let playlistInfos = await getPlaylistInfos(url);
            let downloadedSongs = 0;
            console.log(`\x1b[44mEn attente de téléchargement de ${playlistInfos.numberOfSongs} éléments issus de la playlist "${playlistInfos.titleOfPlaylist}"\x1b[0m`);
            for (const videoID of titleOfPlaylist) {
                let title = await getTitle(videoID);
                downloadedSongs++;
                downloadPlaylistMP3(videoID, title, playlistInfos.numberOfSongs, downloadedSongs);
            } 
        } else {
            downloadMP3(url);
        }
    }

    if (format === "mp4") {
        if (isplaylist === "playlist") {
            let playlistInfos = await getPlaylistInfos(url);
            let downloadedVideos = 0;
            console.log(`\x1b[44mEn attente de téléchargement de ${playlistInfos.numberOfSongs} éléments issus de la playlist "${playlistInfos.titleOfPlaylist}"\x1b[0m`);
            for (const videoID of titleOfPlaylist) {
                downloadedVideos++;
                downloadMP4(videoID, "playlist", playlistInfos.numberOfSongs, downloadedVideos);
            }
        } else {
            downloadMP4(url);
        }
    }
});