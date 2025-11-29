// Diverses importations
const path = require("node:path");
const { contextBridge, ipcRenderer } = require("electron");
const { createModal, showDownloadInfos } = require("./frontend/renderer");

async function getCMDlogo() {
    const app_path = await ipcRenderer.invoke("getFrontendLogo");
    const logo = path.join(app_path, "logos/blanc.png");

    return logo;
}

// Reçois les informations de téléchargements
ipcRenderer.on("downloadsInfos", (event, data) => { 
    showDownloadInfos(data); //Affiche les informations de téléchargements
});

// Reçois les informations de téléchargements
ipcRenderer.on("errorInfos", (event, data) => { 
    createModal(data); // Affiche les informations des erreurs
});

// Exposition des fonctions pour le script fronted
contextBridge.exposeInMainWorld("extraFunctions", {
    createModal: (data) => createModal(data),
    downloadRequest: (data) => ipcRenderer.send("downloader", data),
    getCMDlogo: () => getCMDlogo()
});

contextBridge.exposeInMainWorld("versions", {
    chrome: () => process.versions.chrome,
    electron: () => process.versions.electron,
    magitivisseur: () => ipcRenderer.invoke("getAppVersion"),
    nodejs: () => process.versions.node
});