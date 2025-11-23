// Diverses importations
import { downloadAudio, downloadVideo } from './backend/downloader.js'
import { extractInfosFromURL } from './backend/extractor.js';
import { Bug } from './backend/error_handler.js';
import config from './config.json' with { type: 'json' };
import { app, BrowserWindow, ipcMain } from 'electron/main';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { handlePlaylist } from './backend/utils.js';

// Prémice du futur système de queue
const CACHE = new Map();
const PLAYLIST_QUEUE = new Map();

// Gestion des erreurs de script
process.on('unhandledRejection', async(error) => {	
	console.error("Une erreur est survenue :c", error);
    return new Bug({
        detail: `${error.stack}`,
        message: "Un script a rencontré une difficulté !",
        title: "unhandledRejection",
        type: "error",
    }).handleBug();
});

// Création de la fenêtre de l'application
let window;
const createWindow = () => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const win = new BrowserWindow({
        focusable: true,    // Permet l'utilisation de la barre input de manière répétée
        width: 800,         // Largeur par défaut
        height: 650,        // Hauteur par défaut
        webPreferences: {
            preload: path.join(__dirname, "preload.js"), // Permet l'utilisation du fichier preload.js
            nodeIntegration: true,
        },
        icon: 'img/logo.png',
        // La menu bar ne s'affiche que si le mode de debug est activé
        autoHideMenuBar: !config.debugMode
    });

    win.loadFile("index.html");

    return win;
}

// Gère les différents évènements quand l'application est lancée
app.whenReady().then(() => {
    // Création de la fenêtre une fois l'application lancée
    window = createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });

    // Gestion des requêtes de téléchargement
    ipcMain.handle('downloader', async (event, data) => {
        
        const { format, url } = data;
        const { id, type_of_url } = extractInfosFromURL(url) ?? {};

        if (id === undefined) {
            return new Bug({
                detail: "Le lien Youtube est invalide",
                message: "Il n'y a pas d'ID de vidéo ou de playlist",
                title: "Bad_link",
                type: "info",
            }).handleBug();
        }

        if (type_of_url === "playlist") {            
            return handlePlaylist(url, format);
        }

        if (format === "audio") {
            return downloadAudio(url);
        }

        if (format === "video") {
            return downloadVideo(url);
        }
    });

    // Future gestion du choix d'emplacement des dossiers pour les téléchargements 
    ipcMain.handle('dialog:openFolder', async (event, msg) => {
        handleFolderOpen();
    });

    // Gestion de la des signals d'erreur
    ipcMain.handle('error', async (event, errorData) => {
        new Bug(errorData).handleBug();
    });

    ipcMain.handle("getAppVersion", (event) => {
        return app.getVersion();
    });
});

// Stop l'application si aucune fenêtre n'est ouverte
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});

export { CACHE, PLAYLIST_QUEUE, window };