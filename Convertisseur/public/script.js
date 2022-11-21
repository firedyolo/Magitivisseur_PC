const serverURL = 'http://localhost:3000';

async function checkPlaylist(url) {
    if (url.indexOf("playlist") === -1) {
        return "isntlistplay";
    } else {
        return "listplay";
    }
}

async function checkLink() {
	if (!document.querySelector('.URL-input').value) {
		alert("Veuillez indiquer un lien youtube !");
	} else {
		let url = document.querySelector('.URL-input').value;
		let playlist = await checkPlaylist(url);
		await redirect(url, playlist).then(() => {
			if (playlist === "listplay") {
				return;
			} else {
				setTimeout(() => {
					window.location.reload();
				}, 10000)
			}
		})
	}
}

async function redirect(url, playlist) {
	const res = await fetch(`${serverURL}/download?url=${url}&fetch=fetch`);
	if (res.status === 200) {
		console.log("Oui");
		window.location.href = `${serverURL}/download?url=${url}&fetch=dwnld&islistplay=${playlist}`;
	} else if (res.status === 400) {
		alert("Le lien n'est pas bon Kévin !");
	} else {
		alert(`Vous avez possiblement un soucis de connexion. Erreur : ${res.status}`);
	}
}