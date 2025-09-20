/* Gère l'affichage du bon css en fonction de la section active */
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

/* Gère l'affichage des différentes sections */
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

async function sendLink(format) {
    //Vérifie si le champ de renseignement du lien est vide ou non
	if (!document.querySelector('.URL-input').value) {
		return window.apiFunctions.sendError({
            message: "Aucun lien n'est donné", 
            title: "Bad_link", 
            type: "warning"
        });
	} else {
        let url = document.querySelector('.URL-input').value; //On récupère la valeur du champ de renseignement
        const data = {
            format: format,
            url: url,
        }

        window.apiFunctions.downloadRequest(data); // Transmission des informations au backend
        document.querySelector('.URL-input').value = ""; // Réinitilisation de la barre de lien
    }
}

addEventListener("load", async () => {
    chooseCSS();
    let electronVersionSpan = document.getElementById("span-electron-version");
    let magitivisseurVersionSpan = document.getElementById("span-magitivisseur-version");
    let nodejsVersionSpan = document.getElementById("span-nodejs-version");
    let chromeVersionSpan = document.getElementById("span-chrome-version");

    electronVersionSpan.innerText = `${versions.electron()}`;
    magitivisseurVersionSpan.innerText = `${await versions.magitivisseur()}`;
    nodejsVersionSpan.innerText = `${versions.nodejs()}`;
    chromeVersionSpan.innerText = `${versions.chrome()}`;
});