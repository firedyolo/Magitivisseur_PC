/* Diverses importations */
const { contextBridge, ipcRenderer } = require("electron");

/* Gère les évènements d'émissions d'erreurs venant du fronted */
ipcRenderer.on("showError", (error_message) => {
    showError(error_message);
});

/* showError envoie un signal "error" au backend qui, ensuite sera traité puis affiché */
function showError (error_message) { ipcRenderer.invoke("error", error_message) }

/* Envoie les données concernant le téléchargement */
function sendData(data) { ipcRenderer.invoke("downloader", data) }

/* Exposition des fonctions pour le script fronted */
contextBridge.exposeInMainWorld("apiFunctions", {
    sendError: (error) => showError(error),
    sendDownloadInfos: (data) => sendData(data),
    //openFile: () => ipcRenderer.invoke('dialog:openFile')
});


















/*contextBridge.exposeInMainWorld("versions", {
    node: () => process.versions.node,
    chrome: () => process.versions.chrome,
    electron: () => process.versions.electron
});*/