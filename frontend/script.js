/* Gère l'affichage des différentes sections */
function showSection(id) {    
    const active_section = document.querySelector('section.active');

    if (id === active_section.id) return;

    active_section.classList.remove("active");

    const target_section = document.getElementById(id);
    target_section.classList.add("active");
}


async function sendLink(format) {
    //Vérifie si le champ de renseignement du lien est vide ou non
	if (!document.querySelector('.URL-input').value) {
		return window.apiFunctions.sendError({
            message: "Aucune lien n'est donné", 
            title: "Bad_link", 
            type: "warning"
        });
	} else {
        let url = document.querySelector('.URL-input').value; //On récupère la valeur du champ de renseignement
        const data = {
            format: format,
            url: url,
        }

        window.apiFunctions.sendDownloadInfos(data); // Transmission des informations au backend
        document.querySelector('.URL-input').value = ""; // Réinitilisation de la barre de lien
    }
}