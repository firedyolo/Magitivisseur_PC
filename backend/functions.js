/* Diverses importations */
import { app, dialog } from 'electron/main';
import homoglyphSearch from "homoglyph-search";
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Readable } from "node:stream";

import { Innertube } from "youtubei.js";

import { playlistQueue, window } from '../main.js';

import downloadConfig from '../config.json' with { type: 'json' }
import { handleQueue } from './queue.js';
import { Bug } from './error-handler.js';

const yt = await Innertube.create({ client_type: "WEB" });

/*const __dirname = path.resolve(path.dirname(''));
const ffmpegBinaries = path.join(__dirname, "ffmpeg");*/

/* Setup FFMPEG */
function getFFmpegBin() {
    const platform = process.platform;
    const __dirname = dirname(fileURLToPath(import.meta.url));

    // Chemin des binaires d'electron utilisé pendant le développement
    const devPath = path.join(__dirname, '..', 'ffmpeg-bin');

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

function checkIfFileExist(filepath) {    
    if (existsSync(filepath)) {
        /*dialog.showMessageBox({
            message: `${filepath} existe déjà. Téléchargement impossible`,
            detail: "Une option pour réécrire les fichiers s'ils existent sera disponible plus tard"
        });*/
        sendDownloadInfos(`${filepath} existe déjà !`, "error");

        return true;
    }
}

/* Télécharge l'audio d'une vidéo Youtube */
async function downloadAudio(videoId, title) {    
    if (title === undefined) {
        title = await getTitle(videoId); // titre du fichier
    }

    //let dir = audioDownloadDir;
    const dir = app.getPath("music");
    
    /*const format = ffmpeg_config.audio.format;
    const ffmpeg_settings = ffmpeg_config.audio.parameters;
    const ffmpeg_settings_with_output = structuredClone(ffmpeg_settings);
    ffmpeg_settings_with_output.push(`${title}.${format}`);*/

    /* S'assure que le fichier n'existe pas déjà */
    if (checkIfFileExist(`${dir}/${title}.mp3`)) {
        return;
    }

    sendDownloadInfos(`Début du téléchargement de : ${title}`, "start");

    /* On récupère le WebReadableStream de l'audio*/
    const audio = await yt.download(videoId, {
        client: "TV",
        format: "any",
        type: "audio",
        quality: "best"
    });

    let passed = true;

    /* Convertissement d'un WebReadable en un Readable */
    const audiostream = Readable.fromWeb(audio);

    //ffmpeg -i INPUT.mkv -map 0:v -map 0:a -c:v libx264 -c:a copy OUTPUT.mp4
    /*const flac = ["-i", "pipe:3", "-codec:a", "flac", "-qscale:a", "2"];
    flac.push(`${dir}/${title}.flac`);*/
    
    const mp3 = ["-loglevel", "error", "-i", "pipe:3", "-c:a", "libmp3lame", "-qscale:a", "2"];
    mp3.push(`${dir}/${title}.mp3`);

    /* Initialement de la commande ffmpeg */
    const ffmpeg_process = spawn(getFFmpegBin(), mp3, {
        stdio: [
            "pipe",
            "pipe",
            "pipe",
            "pipe"
        ]
    });

    ffmpeg_process.on('error', (error) => {
        console.log("Ffmpeg can't start :c", error);
    });

    /* Utilisation des pipes pour encoder l'audio */
    audiostream.pipe(ffmpeg_process.stdio[3]); // audiostream vers pipe:3

    ffmpeg_process.stderr.on('data', (data) => {
        passed = false;
        console.error(`stderr: ${data}`);
        new Bug({
            detail: `Video ID : ${videoId} \nVideo : ${title} \nDetails : ${data}`,
            message: "Une erreur est survenue avec FFMPEG",
            title: "Ffmpeg_error",
            type: "error",
        }).handleBug();
    });

    /* Event ffmpeg quand le processus s'arrrête */
    ffmpeg_process.on('close', code => {
        if (passed) {
            return sendDownloadInfos(`${title} est téléchargé !`, "success");
        }
    });
}

/* Permet de télécharger la vidéo cible */
async function downloadVideo(videoId, title) {
    //const title = await getTitle(videoId); // titre du fichier

    if (title === undefined) {
        title = await getTitle(videoId); // titre du fichier
    }

    //let dir = audioDownloadDir;
    const dir = app.getPath("videos");

    /* S'assure que le fichier n'existe pas déjà */
    if (checkIfFileExist(`${dir}/${title}.mp4`)) {
        return;
    }

    sendDownloadInfos(`Début du téléchargement de : ${title}`, "start");
    let passed = true;

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
    const ffmpeg_process = spawn(getFFmpegBin(), [
        "-loglevel", "error",
        '-i', 'pipe:3',
        '-i', 'pipe:4',
        '-map', '0:a',
        '-map', '1:v',
        '-c:v', 'copy',
        '-c:a', 'copy',
        `${dir}/${title}.mp4`,
    ], {
        stdio: [
            'pipe',  // 0 = stdin (console input)
            'pipe',  // 1 = stdout (console output)
            'pipe',  // 2 = stderr (console error)
            'pipe',     // 3 = pipe input 1 (audio ou vidéo)
            'pipe',     // 4 = pipe input 2 (audio ou vidéo)
        ]
    });

    ffmpeg_process.on('error', (error) => {
        console.log("Ffmpeg can't start :c", error);
        return new Bug({
            detail: `${error.stack}`,
            message: "Un problème est survenu avec ffmpeg",
            title: "ffmpeg_error",
            type: "error",
        }).handleBug();
    });

    /* Utilisation des pipes pour "merge" l'audio et la vidéo */
    audiostream.pipe(ffmpeg_process.stdio[3]); // audiostream vers pipe:4
    videostream.pipe(ffmpeg_process.stdio[4]); // videostream vers pipe:5

    ffmpeg_process.stderr.on('data', (data) => {
        passed = false;
        console.error(`stderr: ${data}`);
        new Bug({
            detail: `Video ID : ${videoId} \nVideo : ${title} \nDetails : ${data}`,
            message: "Une erreur est survenue avec FFMPEG",
            title: "Ffmpeg_error",
            type: "error",
        }).handleBug();
    });

    /* Event ffmpeg quand le processus s'arrrête */
    ffmpeg_process.on('close', code => {
        if (passed) {
            return sendDownloadInfos(`${title} est téléchargé !`, "success");
        }
    });
}

/* Fonction utilisant RegEx afin d'extraire l'id du lien */
function extractInfosFromYoutubeURL(url) {
    const regex = /https:\/\/(www.|)(youtube.com|youtu.be)\/(?<type_of_url>watch|playlist|)(\?list=|\?v=|)(?<id>[A-Za-z0-9\-\_]+)/;
    return regex.exec(url)?.groups;
}

// https://youtube.com/playlist?list=PLqCaf82rnbbOw8LOd9JpGfCjy8axTAHVK&feature=shared : 3 items
// https://youtube.com/playlist?list=PLqCaf82rnbbOr7eE7Q-6FeLE4DjTqLCAp&feature=shared : 40 items
// https://youtube.com/playlist?list=PLqCaf82rnbbM-wKrXXVUwlV1Y8fA1NX6X&feature=shared : 400 items
// https://www.youtube.com/playlist?list=PLqCaf82rnbbN3u40-q2pxvav-qQTSjF3N : 600 items

async function getPlaylistInfos(playlistID, format) {    
    const playlist = await yt.getPlaylist(playlistID, {
        client: "WEB"
    });
    
    for (const [index, video] of playlist.items.entries()) {
        /*if (index === 0) {
            handleQueue.emit("add", "log !")
        }*/
        
        playlistQueue.add({
            "authorName": video.author.name,
            "format": format,
            "videoID": video.id,
            "videoTitle": video.title.text
        });
    }

    let page = playlist;

    while (page.has_continuation) {
        page = await page.getContinuation();

        for (const video of page.items) {
            playlistQueue.add({
                "authorName": video.author.name,
                "format": format,
                "videoID": video.id,
                "videoTitle": video.title.text
                //"videoTitle": await getTitle(video.id)
            });
        }
    }

    return { "playlistName": playlist.info.title, "playlistItems": playlist.info.total_items };
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

/* Permet de gérer la demande de téléchargement des Playlists */
async function handlePlaylist(playlistID, format) {    
    const { playlistName, playlistItems } = await getPlaylistInfos(playlistID, format);
    sendDownloadInfos(`${playlistName} : début du téléchargement de ${playlistItems}`, 'other');

    if (format === "audio") {
        for (const video of playlistQueue) {
            downloadAudio(video.videoID);
            playlistQueue.delete(video);
        }
    }

    if (format === "video") {
        for (const video of playlistQueue) {
            downloadVideo(video.videoID);
            playlistQueue.delete(video);
        }
    }    
}

async function sendDownloadInfos(message, status) {
    window.webContents.send('downloadsInfos', {
        message: message,
        status: status
    });
    /*dialog.showMessageBox({
        message: `${title} est téléchargé !`
    });*/
}

export {
    downloadAudio,
    downloadVideo,
    extractInfosFromYoutubeURL,
    handlePlaylist,
    sendDownloadInfos
}