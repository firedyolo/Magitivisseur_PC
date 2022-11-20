const serverURL = 'http://localhost:3000';

async function checkLink() {
	if (!document.querySelector('.URL-input').value) {
		alert("Veuillez indiquer un lien youtube !");
	} else {
		await redirect(document.querySelector('.URL-input').value).then(
			setTimeout(() => {
				window.location.reload();
			}, 10000)
		)
	}
}

async function redirect(url) {
	const res = await fetch(`${serverURL}/download?url=${url}&fetch=fetch`);
	if (res.status === 200) {
		console.log("Oui");
		window.location.href = `${serverURL}/download?url=${url}&fetch=dwnld`;
	} else if (res.status === 400) {
		alert("Le lien n'est pas bon Kévin !");
	} else {
		alert(`Vous avez possiblement un soucis de connexion. Erreur : ${res.status}`);
	}
}