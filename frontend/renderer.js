/*const btn = document.getElementById("convert");
const filePathElement = document.getElementById("filepath");

console.log(btn);
btn.addEventListener("click", async () => {
    const filePath = await window.electronAPI.openFile();
    filePathElement.innerHTML = filePath;
});*/

// Fonction qui affiche les informations de téléchargement dans le CMD de la page principale
function showDownloadInfos(download_Data) {
    let cmd = document.getElementById("cmd-container");
    let rectangle = document.getElementById("cmd-typing-animation");
    let new_prompt = document.createElement("p");
    new_prompt.innerText = download_Data.message;

    // Mise en style du texte qui s'affiche
    switch (download_Data.status) {
        case "success":
            new_prompt.style.color = "green";
            break;
            
        case "error":
            new_prompt.style.color = "red";
            break;
        
        case "warning":
            new_prompt.style.color = "#df922eff";
            break

        case "start":
            new_prompt.style.color = "#06ADC2";
            break;

        case "other":
            new_prompt.style.color = "#df9cecff";
            break;
        
        default:
            new_prompt.style.color = "rgba(231, 138, 240, 1)";
            break;
    }

    cmd.insertBefore(new_prompt, rectangle); // Insertion du texte au-dessus du rectangle
}

export { showDownloadInfos }