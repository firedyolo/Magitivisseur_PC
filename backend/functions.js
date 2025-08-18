/* Diverses importations */
import { app, dialog } from 'electron/main';
import homoglyphSearch from "homoglyph-search";
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from 'node:path';
import { Readable } from "node:stream";
import { Innertube } from "youtubei.js";

const yt = await Innertube.create({ client_type: "WEB" });

/*const __dirname = path.resolve(path.dirname(''));
const ffmpegBinaries = path.join(__dirname, "ffmpeg");*/

/* Setup FFMPEG */
function getFFmpegBin() {
    const platform = process.platform;

    // Chemin des binaires d'electron utilisé pendant le développement
    const devPath = path.join("/", 'ffmpeg-bin');

    // Chemin des binaires d'electron utilisé dans le build
    const prodPath = path.join(process.resourcesPath, 'ffmpeg-bin');

    // "base" réfère le chemin a utilisé
    const base = app.isPackaged ? prodPath : devPath;

    // Utilisation du bon exécutable en fonction de l'OS
    if (platform === 'win32') return path.join(base, 'windows', 'ffmpeg.exe');
    if (platform === 'linux') return path.join(base, 'linux', 'ffmpeg');
    //if (platform === 'darwin') return path.join(base, 'mac', 'ffmpeg');

    throw new Error('Platform non supportée');
}

function checkifFileExist(filepath) {
    if (existsSync(filepath)) {
        dialog.showMessageBox({
            message: `${filepath} existe déjà. Téléchargement impossible`,
            detail: "Une option pour réécrire les fichiers s'ils existent sera disponible plus tard"
        });

        return true;
    }
}

/* Télécharge l'audio d'une vidéo Youtube */
async function downloadAudio(videoId, dir) {
    const title = await getTitle(videoId); // titre du fichier
    /*const format = ffmpeg_config.audio.format;
    const ffmpeg_settings = ffmpeg_config.audio.parameters;
    const ffmpeg_settings_with_output = structuredClone(ffmpeg_settings);
    ffmpeg_settings_with_output.push(`${title}.${format}`);*/

    /* S'assure que le fichier n'existe pas déjà */
    if (checkifFileExist(`${dir}/${title}.mp3`)) {
        return;
    }

    /* On récupère le WebReadableStream de l'audio*/
    const audio = await yt.download(videoId, {
        client: "TV",
        format: "any",
        type: "audio",
        quality: "best"
    });

    /* Convertissement d'un WebReadable en un Readable */
    const audiostream = Readable.fromWeb(audio);

    //ffmpeg -i INPUT.mkv -map 0:v -map 0:a -c:v libx264 -c:a copy OUTPUT.mp4
    /*const flac = ["-i", "pipe:3", "-codec:a", "flac", "-qscale:a", "2"];
    flac.push(`${title}.${format}`);*/

    const mp3 = ["-i", "pipe:3", "-c:a", "libmp3lame", "-qscale:a", "2"];
    mp3.push(`${dir}/${title}.mp3`);

    /* Initialement de la commande ffmpeg */
    const ffmpeg = spawn(getFFmpegBin(), mp3, {
        stdio: [
            'ignore',  // 0 = stdin (console input)
            'ignore',  // 1 = stdout (console output)
            'inherit',  // 2 = stderr (console error)
            'pipe',     // 3 = pipe input 1 (audio ou vidéo)
        ]
    });

    /* Utilisation des pipes pour encoder l'audio */
    audiostream.pipe(ffmpeg.stdio[3]); // audiostream vers pipe:4

    /* Event ffmpeg quand le processus s'arrrête */
    ffmpeg.on('close', code => {
        console.log(`ffmpeg exited with code ${code}`);
        sendDownloadInfos(title);
    });
}

/* Permet de télécharger la vidéo cible */
async function downloadVideo(videoId, dir) {
    const title = await getTitle(videoId); // titre du fichier

    /* S'assure que le fichier n'existe pas déjà */
    if (checkifFileExist(`${dir}/${title}.mp4`)) {
        return;
    }

    /* On récupère le WebReadableStream de l'audio et video*/
    const audio = await yt.download(videoId, {
        client: "TV",
        format: "any",
        type: "audio",
        quality: "best"
    });

    const video = await yt.download(videoId, {
        client: "TV",
        format: "any",
        type: "video",
        quality: "best"
    });

    /* Convertissement d'un WebReadable en un Readble */
    const audiostream = Readable.fromWeb(audio);
    const videostream = Readable.fromWeb(video);

    /* Initialement de la commande ffmpeg */
    const ffmpeg = spawn(getFFmpegBin(), [
        '-i', 'pipe:3',
        '-i', 'pipe:4',
        '-map', '0:a',
        '-map', '1:v',
        '-c:v', 'copy',
        '-c:a', 'copy',
        `${dir}/${title}.mp4`,
    ], {
        stdio: [
            'ignore',  // 0 = stdin (console input)
            'ignore',  // 1 = stdout (console output)
            'inherit',  // 2 = stderr (console error)
            'pipe',     // 3 = pipe input 1 (audio ou vidéo)
            'pipe',     // 4 = pipe input 2 (audio ou vidéo)
        ]
    });

    /* Utilisation des pipes pour "merge" l'audio et la vidéo */
    audiostream.pipe(ffmpeg.stdio[3]); // audiostream vers pipe:4
    videostream.pipe(ffmpeg.stdio[4]); // videostream vers pipe:5

    /* Event ffmpeg quand le processus s'arrrête */
    ffmpeg.on('close', code => {
        console.log(`ffmpeg exited with code ${code}`);
        sendDownloadInfos(title);
    });
}

/* Fonction utilisant RegEx afin d'extraire l'id du lien */
function extractInfosFromYoutubeURL(url) {
    const regex = /https:\/\/(www.|)(youtube.com|youtu.be)\/(?<type_of_url>watch|playlist|)(\?list=|\?v=|)(?<id>[A-Za-z0-9\-\_]+)/;
    return regex.exec(url)?.groups;
}

/* Permet de récupérer le titre de la vidéo */
async function getTitle(videoId) {
    const videoInfo = await yt.getInfo(videoId, {
        client: "WEB"
    });

    let title = videoInfo.primary_info.title.text;
    const authorName = videoInfo.secondary_info.owner.author.name;
    const is_artist = videoInfo.secondary_info.owner.author.is_verified_artist;

    if (is_artist) {
        const artistNameInTitle = homoglyphSearch.search(title, [authorName]);        

        if (artistNameInTitle.length === 0) {
            title = `${authorName} - ${title}`;
        }
    }

    /* 
        sinon
            Renvoyer l'artiste, la position de la musique, le titre au front dans le local Storage
            Ensuite, faire une fonction qui permet de rajouter le nom de chaîne au titre (section sur le front)
    */
            
    // On retourne le titre avec la suppression de nombreux caractères spéciaux problématiques
    return title.replace(/[<>:;,?"*\/^|>]+/g, "");
}

async function sendDownloadInfos(title) {
    dialog.showMessageBox({
        message: `${title} est téléchargé !`
    });
}

export {
    downloadAudio,
    downloadVideo,
    extractInfosFromYoutubeURL,
}