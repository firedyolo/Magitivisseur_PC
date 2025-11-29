import { debugAudio, debugVideo, debugMode } from "./debug.js";
import { app } from "electron/main";
import { Bug } from "./error_handler.js";
import { getCoverImage } from "./extractor.js";
import { spawn } from "node:child_process";
import { Readable } from "node:stream";
import { checkIfFileExist, makeTitle, sendDownloadInfos } from "./utils.js";
import config from '../config.json' with { type: 'json' };

import { getBinariesFolder } from "./choose_binaries.js";

const { ffmpeg, ytdlp } = getBinariesFolder();

async function downloadAudio(url, title) {
    const dir = app.getPath("music");
    const format = config.downloadConfig.audio.format;

    if (title === undefined) {
        title = await makeTitle(url) // titre du fichier
    }

    // S'assure que le fichier n'existe pas déjà
    if (checkIfFileExist(`${dir}/${title}.${format}`)) {
        return;
    }

    sendDownloadInfos(`Début du téléchargement de : ${title}`, "start");

    const audio_args = `--no-playlist --extract-audio --audio-quality 0 --audio-format ${format} -o - ${url}`;
    const ytdl_audio_process = spawn(ytdlp, audio_args.split(" "));

    const streamable_cover = Readable.fromWeb(await getCoverImage(url));

    // Initialement de la commande ffmpeg
    const ffmpeg_process = spawn(ffmpeg, [
        "-loglevel", "error",
        '-i', 'pipe:3',
        '-i', 'pipe:4',
        '-map', '0:0',
        '-map', '1:0',
        `${dir}/${title}.${format}`
    ], {
        stdio: [
            'pipe',  // 0 = stdin (console input)
            'pipe',  // 1 = stdout (console output)
            'pipe',  // 2 = stderr (console error)
            'pipe',  // 3 = pipe input 1 (audio)
            'pipe',  // 4 = pipe input 2 (cover)
        ]
    });

    let passed = true;

    ytdl_audio_process.stdout.pipe(ffmpeg_process.stdio[3]); // audio vers pipe:3
    streamable_cover.pipe(ffmpeg_process.stdio[4]); // cover vers pipe:4

    ffmpeg_process.stderr.on('data', (data) => {
        passed = false;
        console.error(`[FFMPEG] stderr: ${data}`);

        new Bug({
            detail: `URL : ${url} \nVideo : ${title} \nDetails : ${data}`,
            message: "Une erreur est survenue avec FFMPEG",
            title: "Ffmpeg_error",
            type: "error",
        }).sendBug();
    });

    // Event ffmpeg quand le processus s'arrrête
    ffmpeg_process.on('close', code => {
        if (passed) {
            console.log(`[FFMPEG] : ${title} est téléchargé !`);
            return sendDownloadInfos(`${title} est téléchargé !`, "success");
        }
    });

    if (debugMode) {
        debugAudio(ytdl_audio_process);
    }
}

async function downloadVideo(url, title) {
    const dir = app.getPath("videos");
    const format = config.downloadConfig.video.format;

    if (title === undefined) {
        title = await makeTitle(url) // titre du fichier
    }

    // S'assure que le fichier n'existe pas déjà
    if (checkIfFileExist(`${dir}/${title}.mp3`)) {
        return;
    }

    sendDownloadInfos(`Début du téléchargement de : ${title}`, "start");

    const audio_args = `--no-playlist -f bestaudio -o - ${url}`;
    const video_args = `--no-playlist -f bestvideo -o - ${url}`;
    const ytdl_audio_process = spawn(ytdlp, audio_args.split(" "));
    const ytdl_video_process = spawn(ytdlp, video_args.split(" "));

    // Initialement de la commande ffmpeg
    const ffmpeg_process = spawn(ffmpeg, [
        "-loglevel", "error",
        '-i', 'pipe:3',
        '-i', 'pipe:4',
        '-map', '0:a',
        '-map', '1:v',
        '-c:v', 'copy',
        '-c:a', 'copy',
        `${dir}/${title}.${format}`,
    ], {
        stdio: [
            'pipe',  // 0 = stdin (console input)
            'pipe',  // 1 = stdout (console output)
            'pipe',  // 2 = stderr (console error)
            'pipe',  // 3 = pipe input 1 (audio)
            'pipe',  // 4 = pipe input 2 (vidéo)
        ]
    });

    let passed = true;

    ytdl_audio_process.stdout.pipe(ffmpeg_process.stdio[3]); // audio vers pipe:3
    ytdl_video_process.stdout.pipe(ffmpeg_process.stdio[4]); // video vers pipe:4

    ffmpeg_process.stderr.on('data', (data) => {
        passed = false;
        console.error(`[FFMPEG] stderr: ${data}`);
        
        new Bug({
            detail: `URL : ${url} \nVideo : ${title} \nDetails : ${data}`,
            message: "Une erreur est survenue avec FFMPEG",
            title: "Ffmpeg_error",
            type: "error",
        }).sendBug();
    });

    // Event ffmpeg quand le processus s'arrrête
    ffmpeg_process.on('close', code => {
        if (passed) {
            console.log(`[FFMPEG] : ${title} est téléchargé !`);
            return sendDownloadInfos(`${title} est téléchargé !`, "success");
        }
    });

    if (debugMode) {
        debugAudio(ytdl_audio_process);
        debugVideo(ytdl_video_process);
    }
}

export { downloadAudio, downloadVideo }