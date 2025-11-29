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

// Permet de créer les boîtes de dialogues
async function createModal(data) {
    // Crée des données de logs par défaut si aucune n'existe    
    if (!data) data = {
        "message": "Ceci est un message d'erreur",
        "icon_path": "frontend/icons/erreur-01.png",
        "title": "TITRE", 
        "type": "error",
    }

    // Récupère les données de logs
    let { detail, icon_path, message, title, type } = data;

    // Crée la boîte de dialogue et l'affiche dès son implémentation
    const modal = document.createElement("dialog");
    modal.setAttribute("open", true);

    // Définit l'image affichée dans la boîte de dialogue
    const icon = document.createElement('img');
    icon.src = icon_path;
    icon.alt = "DIALOG_ICON";

    // Définit le "fieldset" ainsi que sa "légende"
    const fieldset = document.createElement("fieldset");
    const legend = document.createElement("legend");
    legend.innerText = title;
    fieldset.append(legend);

    // Crée le paragraphe contenant le message d'erreur et l'insère au fieldset
    const message_box = document.createElement("p");
    message_box.innerText = message;
    fieldset.append(message_box);

    // Insère les détails s'ils existent
    if (detail) {
        const detail_box = document.createElement("details");
        const pre_format = document.createElement("pre");
        pre_format.innerText = detail;
        detail_box.append(pre_format);

        // On ajoute les détails au fieldset
        fieldset.append(detail_box);
    }

    // Crée le formulaire avec le bouton pour fermer la boîte de dialogue
    const form = document.createElement("form");
    const form_button = document.createElement("button");
    form.setAttribute("method", "dialog");
    form_button.setAttribute("id", "modal-button");
    form_button.innerText = "Ok :c";
    form.append(form_button);

    // On ajoute le formulaire au fieldset
    fieldset.append(form);

    // On ajoute l'image à la boîte de dialogue ainsi que le fieldset
    modal.append(icon);
    modal.append(fieldset);

    // On ajoute la boîte de dialogue à la page pour qu'elle soit affichée
    document.body.append(modal);
}

export { createModal, showDownloadInfos }