import { spawn } from "node:child_process";
import { debugPrint, debugMode } from "./debug.js";
import { getBinariesFolder } from "./choose_binaries.js";
import { CACHE, PLAYLIST_QUEUE } from '../main.js';

const { ytdlp } = getBinariesFolder();

// Fonction utilisant RegEx afin d'extraire l'id du lien
function extractInfosFromURL(url) {
    const regex = /https:\/\/(www.|)(youtube.com|youtu.be)\/(?<type_of_url>watch|playlist|)(\?list=|\?v=|)(?<id>[A-Za-z0-9\-\_]+)/;
    return regex.exec(url)?.groups;
}

// Permet de récupérer le "ReadableStream" de l'image de cover (utile pour les fichiers audios)
async function getCoverImage(url) {
    const link = await new Promise((resolve, reject) => {
        const get_cover_link_args = `--no-playlist --get-thumbnail ${url}`.split(" ");
        const ytdl_get_link_process = spawn(ytdlp, get_cover_link_args);

        ytdl_get_link_process.stdout.on('data', (data) => {
            return resolve(`${data}`);
        });
    });

    return await fetch(link).then((res) => { return res.body });
}

// Récupère les informations sur l'url
async function getInfos(url) {    
    const title = new Promise((resolve, reject) => {
        const get_title_args = `--no-download --print title ${url}`.split(" ");

        if (debugMode) {
            const title_process = spawn(ytdlp, get_title_args);

            title_process.stdout.on('data', (data) => {
                return resolve({ "title": data.toString().replace("\n", "") });
            });

            debugPrint(title_process, "GET_INFOS title");
        } else {
            get_title_args.unshift("--no-warning");
            const title_process = spawn(ytdlp, get_title_args);

            title_process.stdout.on('data', (data) => {
                return resolve({ "title": data.toString().replace("\n", "") });
            });

            title_process.stderr.on("data", (data) => {
                return reject(`[Get_INFOS title] STDERR : ${data}`);
            });
        }
    });

    const uploader = new Promise((resolve, reject) => {
        const get_uploader_args = `--no-download --print uploader ${url}`.split(" ");

        if (debugMode) {
            const uploader_process = spawn(ytdlp, get_uploader_args);

            uploader_process.stdout.on('data', (data) => {
                return resolve({ "uploader": data.toString().replace("\n", "") });
            });

            debugPrint(uploader_process, "GET_INFOS uploader");
        } else {
            get_uploader_args.unshift("--no-warning");
            const uploader_process = spawn(ytdlp, get_uploader_args);

            uploader_process.stdout.on('data', (data) => {
                return resolve({ "uploader": data.toString().replace("\n", "") });
            });

            uploader_process.stderr.on("data", (data) => {
                return reject(`[Get_INFOS uploader] STDERR : ${data}`);
            });
        }
    });

    const channel_is_verified = new Promise((resolve, reject) => {
        const get_channel_is_verified_args = `--no-download --print channel_is_verified ${url}`.split(" ");

        if (debugMode) {
            const channel_is_verified_process = spawn(ytdlp, get_channel_is_verified_args);

            channel_is_verified_process.stdout.on('data', (data) => {
                return resolve({ "verified": data.toString().replace("\n", "") });
            });

            debugPrint(channel_is_verified_process, "GET_INFOS channel_is_verified");
        } else {
            get_channel_is_verified_args.unshift("--no-warning");
            const channel_is_verified_process = spawn(ytdlp, get_channel_is_verified_args);

            channel_is_verified_process.stdout.on('data', (data) => {
                return resolve({ "verified": data.toString().replace("\n", "") });
            });

            channel_is_verified_process.stderr.on("data", (data) => {
                return reject(`[Get_INFOS channel_is_verified] STDERR : ${data}`);
            });
        }
    });

    return Promise.all([title, uploader, channel_is_verified]).then((values) => {
        return {
            "title": values.find(key => key.title).title,
            "uploader": values.find(key => key.uploader).uploader,
            "verified": values.find(key => key.verified).verified.toLowerCase() === "true"
        }
    });
}

// Récupère les informations sur la playlist
async function getPlaylistInfos(url, useOfIndex) {
    const playlist_args = `-s -J --flat-playlist ${url}`.split(" ");

    const playlist_data = await new Promise((resolve, reject) => {
        
        const proc = spawn(ytdlp, playlist_args);

        let jsonStringify = "";
    
        proc.stdout.on('data', async (data) => {
            jsonStringify = jsonStringify.concat(data.toString());        
        });

        proc.stdout.on("close", (close) => {        
            resolve(JSON.parse(jsonStringify));
        });
    });

    // Informations issues de la playlist
    const playlist_id = playlist_data.id;
    const playlist_title = playlist_data.title;
    const playlist_entries = playlist_data.entries;
    
    PLAYLIST_QUEUE.set(playlist_id, []);
    CACHE.set(playlist_id, {
        "duration": 0,
        "title": playlist_title
    });
    
    playlist_entries.forEach(video => {
        const { title, duration, uploader, id, url } = video;
        const playlist_items = PLAYLIST_QUEUE.get(playlist_id);
        playlist_items.push({
            "url": url,
            "title": title,
            "uplaoder": uploader,
            //"duration": duration, // À voir si ça sert à quelque chose un jour
            "id": id
        });

        CACHE.set(playlist_id, { "duration": CACHE.get(playlist_id).duration + duration, "title": playlist_title });        
    });

    return { "playlist_id": playlist_id, "playlist_title": playlist_title, "playlist_entries": playlist_entries.length, "playlist_duration": CACHE.get(playlist_id).duration };
}

export {
    extractInfosFromURL,
    getCoverImage,
    getInfos,
    getPlaylistInfos
}