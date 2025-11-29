// Gère l'affichage du bon css en fonction de la section active
function chooseCSS(target_section_id) {
    let active_section = document.querySelector('section.active');
    let active_stylesheet = document.getElementById("sections-stylesheets");

    if (active_section === null) {
        active_section = document.getElementById("convert");
        active_section.classList.add("active");
    }

    if (active_stylesheet === null) {
        active_stylesheet = document.createElement("link");
        active_stylesheet.id = "sections-stylesheets";
        active_stylesheet.rel = "stylesheet";
        active_stylesheet.type = "text/css";        

        active_section === null ?
            active_stylesheet.href = './frontend/styles/sections/convert.css' :
            active_stylesheet.href = `./frontend/styles/sections/${active_section.id}.css`;
            
        return document.head.appendChild(active_stylesheet);
    }

    // class="active"
    active_stylesheet.href = `./frontend/styles/sections/${target_section_id}.css`;
}

// Envoie le lien au backend
async function sendLink(format) {
    let url = document.querySelector('.URL-input').value; // On récupère la valeur du champ de renseignement
    const data = {
        format: format,
        url: url,
    }

    window.extraFunctions.downloadRequest(data); // Transmission des informations au backend
    document.querySelector('.URL-input').value = ""; // Réinitilisation de la barre de lien
}

// Gère l'affichage des différentes sections
function showSection(target_section_id) {    
    const active_section = document.querySelector('section.active');
    //const active_button = document.querySelector('button.active');

    if (target_section_id === active_section.target_section_id) return;

    active_section.classList.remove("active");
    //active_button.classList.remove("active");

    const target_section = document.getElementById(target_section_id);
    //const target_button = document.getElementById(`${target_section_id}-btn-menu`);
    
    target_section.classList.add("active");
    //target_button.classList.add("active");
    
    chooseCSS(target_section_id);
}

// Affiche les informations de versions
addEventListener("load", async () => {
    const cmd_logo = document.getElementById("cmd-logo");
    const logo = await window.extraFunctions.getCMDlogo();    
    cmd_logo.src = logo;
    
    chooseCSS();
    let infosElectronVersionSpan = document.getElementById("span-electron-version");
    let infosMagitivisseurVersionSpan = document.getElementById("span-magitivisseur-version");
    let infosNodejsVersionSpan = document.getElementById("span-nodejs-version");
    let infosChromeVersionSpan = document.getElementById("span-chrome-version");
    let cmdMagitivisseurVersion = document.getElementById("cmd-Magitivisseur-version");

    infosElectronVersionSpan.innerText = `${versions.electron()}`;
    infosMagitivisseurVersionSpan.innerText = `${await versions.magitivisseur()}`;
    infosNodejsVersionSpan.innerText = `${versions.nodejs()}`;
    infosChromeVersionSpan.innerText = `${versions.chrome()}`;
    cmdMagitivisseurVersion.innerText = `Magitivisseur - v${await versions.magitivisseur()}`;
});

// Permet de gérer la suppression des boîtes de dialogues
addEventListener("click", (event) => {
    if (event.target.id === "modal-button") {
        event.preventDefault();

        const modal_button = document.getElementById("modal-button");
            
        const modal = modal_button.offsetParent;
        modal.remove();
    }
});