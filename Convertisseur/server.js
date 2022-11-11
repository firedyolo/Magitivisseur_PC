const express = require('express');
const cors = require('cors');
const ytdl = require('ytdl-core');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { document } = (new JSDOM(`...`)).window;
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.static('public'));
app.listen(PORT, () => {
    console.log(`Le serveur fonctionne bien ! Rendez-vous sur : http://localhost:3000`);
});

let sessionNow = new Date().toLocaleDateString("fr-FR", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'});
let hour = new Date().getHours();
let minutes = new Date().getMinutes();
if (minutes < 10) minutes = `0${minutes}`;
let horaire = `${hour}h${minutes}`;

app.get('/', function(req, res) {
    res.render("./index.ejs", {
        root: __dirname,
        sessionDate: sessionNow,
        heure: horaire
    });
});

app.get('/download', async (req, res) => {
    let url = req.query.url;

    if(!ytdl.validateURL(url)) {
        return res.sendStatus(400);
    }

    async function getTitle(url) {
        let infos = await ytdl.getBasicInfo(url);
        return infos.videoDetails.title.replace(/[^\w\s]/g, '');
    }
    
    let title = await getTitle(url);

    async function download(url) {
        let dwnldHour = new Date().getHours();
        let dwnldMinutes = new Date().getMinutes();
        if (dwnldMinutes < 10) dwnldMinutes = `0${dwnldMinutes}`;
        console.log(`${dwnldHour}h${dwnldMinutes} : Le téléchargement de "${title}" a débuté !`);

        res.header('Content-Disposition', `attachment; filename="${title}.mp3"`);
		ytdl(url, {
			format: 'mp3',
			filter: 'audioonly',
		}).pipe(res);
    }

    download(url);
});