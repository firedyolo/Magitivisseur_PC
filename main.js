/* Diverses importations */
import { app, BrowserWindow, ipcMain } from 'electron/main';
import { Bug } from './backend/error-handler.js';
import path from 'node:path';
import { downloadAudio, downloadVideo, extractInfosFromYoutubeURL, handlePlaylist, sendDownloadInfos } from './backend/functions.js';
import { fileURLToPath } from 'node:url';

const playlistQueue = new Set();

process.on('unhandledRejection', async(error) => {	
	console.error("Une erreur est survenue :c", error);
    return new Bug({
        detail: `${error.stack}`,
        message: "Un script a rencontré une difficulté !",
        title: "unhandledRejection",
        type: "error",
    }).handleBug();
});

/* Création de la fenêtre de l'application */
let window;
const createWindow = () => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const win = new BrowserWindow({
        focusable: true, // Permet l'utilisation de la barre input de manière répétée
        width: 800,      // Largeur par défaut
        height: 650,     // Hauteur par défaut
        webPreferences: {
            preload: path.join(__dirname, "preload.js"), // Permet l'utilisation du fichier preload.js
            nodeIntegration: true,
        },
        autoHideMenuBar: true
    });

    win.loadFile("index.html");

    return win;
}

/* Gère les différents évènements quand l'application est lancée */
app.whenReady().then(() => {
    /* Création de la fenêtre une fois l'application lancée */
    window = createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });

    /* Gestion des requêtes de téléchargement */
    ipcMain.handle('downloader', async (event, data) => {
        const { format, url } = data;
        const { id, type_of_url } = extractInfosFromYoutubeURL(url) ?? {};        

        if (id === undefined) {
            return new Bug({
                detail: "Le lien Youtube est invalide",
                message: "Il n'y a pas d'ID de vidéo ou de playlist",
                title: "Bad_link",
                type: "error",
            }).handleBug();
        }

        if (type_of_url === "playlist") {
            
            return handlePlaylist(id, format);
            /* 
                handlePlaylist(format, playlistID)
                    EmitToFront quand une video se télécharge avec les infos comme avant
                    downloadType()
            */
        }

        if (format === "audio") {
            return downloadAudio(id);
        }

        if (format === "video") {
            return downloadVideo(id);
        }
    });

    /* Future gestion du choix d'emplacement des dossiers pour les téléchargements */
    ipcMain.handle('dialog:openFolder', async (event, msg) => {
        handleFolderOpen();
    });

    /* Gestion de la des signals d'erreur */
    ipcMain.handle('error', async (event, errorData) => {
        new Bug(errorData).handleBug();
    });

    ipcMain.handle("getAppVersion", (event) => {
        return app.getVersion();
    });
});

/* Stop l'application si aucune fenêtre n'est ouverte */
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});

export { playlistQueue, window };

/* Permet d'envoyer au preload les données de l'erreur si elle vient du backend */
//win.webContents.send('showError', "bonjour");