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

let serverDate = new Date();
let filesDownloaded = [];

app.get('/', async function(req, res) {
    let filesDownloadedReverse = filesDownloaded.reverse();

    res.render("./index.ejs", {
        root: __dirname,
        sessionDate: getDay(serverDate),
        heure: getHoraire(serverDate),
        data: filesDownloadedReverse
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
        let videoInfos = await getVideoInfos(url);
        console.log(`${getHoraire(new Date())} : Vous avez téléchargé => ${videoInfos.title}`);
        
        res.header('Content-Disposition', `attachment; filename="${videoInfos.title}.mp3"`);
		ytdl(url, {
			format: 'mp3',
			filter: 'audioonly',
		}).pipe(res);
  
        filesDownloaded.push({title: videoInfos.title, author: videoInfos.author, horaire: getHoraire(new Date())});
    }

    async function downloadPlaylist(url, title) {
        if (fs.existsSync("./playlistSongs")) {
            ytdl(url, {
                format: 'mp3',
                filter: 'audioonly',
            }).pipe(fs.createWriteStream(`./playlistSongs/${title}.mp3`));
        } else {
            return console.log("Veuillez créer un dossier à l'emplacement indiqué comme dans le fichier PDF, nommé : playlistSongs");
        }
    }

    async function getPlaylistInfos(url) {
        let infos = await ytpl(url, {pages: Infinity});

        for (const video of infos.items) {
            titleOfPlaylist.push(video.id);
        }
    }

    //Exécution de la playlist ou pas
    if (isplaylist === "listplay") {
        await getPlaylistInfos(url);
        for (const videoID of titleOfPlaylist) {
            let title = await getTitle(videoID);
            downloadPlaylist(videoID, title);
        }
    } else {
        download(url);
    }
});