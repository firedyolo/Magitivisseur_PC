// Permet d'afficher les statuts de téléchargement dans le CMD de la page
/*setInterval(() => {
    $.get('/status', async function(res) {
        if (res.msg === undefined || res.msg.length === 0) return;

        // Création & récupérations des éléments déjà existants
        let cmd = document.getElementById("statut");
	    let rectangle = document.getElementById("rectangle");
	    let new_prompt = document.createElement("p");
	    new_prompt.innerText = res.msg;

        // Mise en style du texte qui s'affiche
	    await res.status === "finish" ? new_prompt.style.color = "green" :  
            res.status === "error" ? new_prompt.style.color = "red" : 
            res.status === "start" ? new_prompt.style.color = "#06ADC2" : new_prompt.style.color = "white";
	    cmd.insertBefore(new_prompt, rectangle); // Insertion du texte au-dessus du rectangle
    });
}, 100);


// Pseudo-système de mise-à-jour
setTimeout(() => {
    $.get('/version', async function(infos) {
        let { client_version, version_on_website } = infos;

        for (const index in client_version.split(".")) { // On converti le json en tableau sans les "."
            const client_version_number = client_version.split(".")[index];
            
            if (client_version_number < version_on_website.split(".")[index]) { // On compare les deux tableaux à un même index donné
                let infoMaj = document.getElementById("maj");
                infoMaj.innerText = `Une mise-à-jour est disponible. (Version ${version_on_website})`;
                infoMaj.style.backgroundColor = "blue";
                
                return console.log("Oui le système de mise-à-jour est bas de gamme :(");
            }
        }
    });
}, 100);*/