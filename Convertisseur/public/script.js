const serverURL = 'http://localhost:3000';

async function checkPlaylist(url) {
    if (url.indexOf("playlist") === -1) {
        return "isntplaylist";
    } else {
        return "playlist";
    }
}

async function checkLink(format) {
	if (!document.querySelector('.URL-input').value) {
		alert("Veuillez indiquer un lien youtube !");
	} else {
		let url = document.querySelector('.URL-input').value;
		let playlist = await checkPlaylist(url);
		await redirect(url, playlist, format);
		setTimeout(() => {
			window.location.reload();
		}, 1500);
	}
}

async function redirect(url, playlist, format) {
	const res = await fetch(`${serverURL}/download?url=${url}&fetch=fetch`);
	if (res.status === 200) {
		window.location.href = `${serverURL}/download?url=${url}&fetch=dwnld&isplaylist=${playlist}&format=${format}`;
	} else if (res.status === 400) {
		alert("Le lien n'est pas bon Kévin !");
	} else {
		alert(`Vous avez possiblement un soucis de connexion. Erreur : ${res.status}`);
	}
}