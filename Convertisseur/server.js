const express = require('express');
const cors = require('cors');
const ytdl = require('ytdl-core');
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

app.get('/download', async (req, res, next) => {
    let url = req.query.url;
    let isFetch = req.query.fetch;

    if(!ytdl.validateURL(url)) {
        return res.sendStatus(400);
    }

    if (isFetch === "fetch") return res.sendStatus(200);

    async function getVideoInfos(url) {
        let infos = await ytdl.getBasicInfo(url);
        return {title: infos.videoDetails.title.replace(/[^\w\s]/g, ''), author: infos.videoDetails.author.name}
    }
    
    let videoInfos = await getVideoInfos(url);

    async function download(url) {
        console.log(`${getHoraire(new Date())} : Vous avez téléchargé => ${videoInfos.title}`);
        
        res.header('Content-Disposition', `attachment; filename="${videoInfos.title}.mp3"`);
		ytdl(url, {
			format: 'mp3',
			filter: 'audioonly',
		}).pipe(res);
  
        filesDownloaded.push({title: videoInfos.title, author: videoInfos.author, horaire: getHoraire(new Date())});
    }

    download(url);
});