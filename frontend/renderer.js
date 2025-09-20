/*const btn = document.getElementById("convert");
const filePathElement = document.getElementById("filepath");

console.log(btn);
btn.addEventListener("click", async () => {
    const filePath = await window.electronAPI.openFile();
    filePathElement.innerHTML = filePath;
});*/

function showDownloadInfos(downloadData) {
    let cmd = document.getElementById("cmd-container");
    let rectangle = document.getElementById("cmd-typing-animation");
    let new_prompt = document.createElement("p");
    new_prompt.innerText = downloadData.message;

    // Mise en style du texte qui s'affiche
    switch (downloadData.status) {
        case "success":
            new_prompt.style.color = "green";
            break;
            
        case "error":
            new_prompt.style.color = "red";
            break;

        case "start":
            new_prompt.style.color = "#06ADC2";
            break;

        case "other":
            new_prompt.style.color = "yellow";
            break;
        
        default:
            new_prompt.style.color = "rgb(197, 250, 250)";
            break;
    }

    cmd.insertBefore(new_prompt, rectangle); // Insertion du texte au-dessus du rectangle
}

export { showDownloadInfos }