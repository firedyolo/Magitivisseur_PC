import { app } from "electron/main";
import { fileURLToPath } from 'node:url';
import path, { dirname } from 'node:path';

function getBinariesFolder() {
    const platform = process.platform;
    const __dirname = dirname(fileURLToPath(import.meta.url));

    let binaries = {
        "ffmpeg": undefined,
        "ytdlp": undefined
    };

    if (platform === "win32") {
        if (app.isPackaged) {
            const binaries_path = path.join(process.resourcesPath, "binaries/windows");
            binaries["ffmpeg"] = path.join(binaries_path, "ffmpeg.exe");
            binaries["ytdlp"] = path.join(binaries_path, "yt-dlp.exe");
        }
            
        else {
            const binaries_path = path.join(__dirname, "../binaries/windows");
            binaries["ffmpeg"] = path.join(binaries_path, "ffmpeg.exe");
            binaries["ytdlp"] = path.join(binaries_path, "yt-dlp.exe");
        }
    }

    if (platform === "linux") {
        if (app.isPackaged) {
            const binaries_path = path.join(process.resourcesPath, "binaries/linux");
            binaries["ffmpeg"] = path.join(binaries_path, "ffmpeg");
            binaries["ytdlp"] = path.join(binaries_path, "yt-dlp");
        }
            
        else {
            const binaries_path = path.join(__dirname, "../binaries/linux");
            binaries["ffmpeg"] = path.join(binaries_path, "ffmpeg");
            binaries["ytdlp"] = path.join(binaries_path, "yt-dlp");
        }
    }

    return binaries;
}

export { getBinariesFolder }