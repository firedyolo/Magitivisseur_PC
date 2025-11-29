import { downloadAudio, downloadVideo } from "./downloader.js";
import { getInfos, getPlaylistInfos } from "./extractor.js";
import homoglyphSearch from "homoglyph-search";
import { CACHE, PLAYLIST_QUEUE, window } from "../main.js";
import { existsSync } from "node:fs";

function checkIfFileExist(filepath) {    
    if (existsSync(filepath)) {
        sendDownloadInfos(`${filepath} existe déjà !`, "warning");
        
        return true;
    }
}

// Gère la gestion des playlists
async function handlePlaylist(url, format) {    
    const { playlist_duration, playlist_id, playlist_title, playlist_entries } = await getPlaylistInfos(url);

    let time = Math.round(playlist_duration / 60);
    let time_format = "min";
    if (time >= 60) {
        time = time / 60;
        time_format = "h";
    }
    
    sendDownloadInfos(`${playlist_title} : Début du téléchargement de ${playlist_entries} vidéos. Approximativement ${time}${time_format} de contenu se télécharge`, 'other');

    if (format === "audio") {
        PLAYLIST_QUEUE.get(playlist_id).forEach((video) => {
            downloadAudio(video.url);
        });

        PLAYLIST_QUEUE.delete(playlist_id);
        CACHE.delete(playlist_id);
    }

    if (format === "video") {
        PLAYLIST_QUEUE.get(playlist_id).forEach((video) => {
            downloadVideo(video.url);
        });

        PLAYLIST_QUEUE.delete(playlist_id);
        CACHE.delete(playlist_id);
    }
}

// Permet de créer le nom du fichier
async function makeTitle(url) {
    let { title, uploader, verified } = await getInfos(url);

    if (verified) {
        const artistNameInTitle = homoglyphSearch.search(title, [uploader]);

        if (artistNameInTitle.length === 0)
            title = `${uploader} - ${title}`;
    }
    
    // On retourne le titre avec la suppression de nombreux caractères spéciaux problématiques
    return title.replace(/[<>:;,?"*\/^|>]+/g, "");
}

// Envoie les infos de téléchargement au frontend
async function sendDownloadInfos(message, status) {
    window.webContents.send('downloadsInfos', {
        message: message,
        status: status
    });
}

export { checkIfFileExist, handlePlaylist, makeTitle, sendDownloadInfos }