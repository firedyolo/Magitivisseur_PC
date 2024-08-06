const serverURL = 'http://localhost:3000'; //URL du serveur local

async function checkPlaylist(url) {
	return url.indexOf("playlist") === -1 ? "isntplaylist" : "playlist";
}

async function checkLink(format) {
	//Vérifie si le champ de renseignement du lien est vide ou non
	if (!document.querySelector('.URL-input').value) {
		alert("Veuillez indiquer un lien youtube !");
	} else {
		let url = document.querySelector('.URL-input').value; //On récupère la valeur du champ de renseignement
		let playlist = await checkPlaylist(url);
		
		await redirect(playlist, format, url); //Permet de renvoyer le lien au serveur pour le téléchargement
		document.querySelector('.URL-input').value = "";
	}
}

async function redirect(playlist, format, url) {
	const res = await fetch(`${serverURL}/download?url=${url}&fetch=fetch`); // Fais une requête au serveur
	if (res.status === 200) { // Le serveur répond qu'il n'y a pas d'erreur
		fetch(`${serverURL}/download?url=${url}&fetch=dwnld&isplaylist=${playlist}&format=${format}`);
	} else if (res.status === 100) {
		alert("Le lien n'est pas bon Kévin !");
	} else {
		alert(`Vous avez possiblement un soucis de connexion. Erreur : ${res.status}`);
	}
}