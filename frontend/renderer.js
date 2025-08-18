/*const btn = document.getElementById("convert");
const filePathElement = document.getElementById("filepath");

console.log(btn);
btn.addEventListener("click", async () => {
    const filePath = await window.electronAPI.openFile();
    filePathElement.innerHTML = filePath;
});*/

function showSection(id) {    
    const active_section = document.querySelector('section.active');

    if (id === active_section.id) return;

    active_section.classList.remove("active");

    const target_section = document.getElementById(id);
    target_section.classList.add("active");
}


async function checkLink(format) {
    //Vérifie si le champ de renseignement du lien est vide ou non
	if (!document.querySelector('.URL-input').value) {
		return window.apiFunctions.sendError("Veuillez indiquer un lien youtube !");
	} else {
		let target_url = document.querySelector('.URL-input').value; //On récupère la valeur du champ de renseignement
		let is_playlist = await checkPlaylist(target_url);
		
		//await redirect(is_playlist, format, target_url); //Permet de renvoyer le lien au serveur pour le téléchargement
		//document.querySelector('.URL-input').value = "";

        //alert(format, target_url, is_playlist);
		return;
	}
}