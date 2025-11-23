# Magitivisseur
Une interface graphique pour **yt-dlp  :)**
# Informations
Ce projet utilise **[electronjs](https://www.electronjs.org/)**, 
**[electron-builder](https://www.electron.build/)**, 
**[NodeJs](https://nodejs.org/fr)**, 
**[yt-dlp](https://github.com/yt-dlp/yt-dlp)**, 
et **[homoglyph-search](https://github.com/codebox/homoglyph)**

## **/!\ IMPORTANT - Faux positif /!\\**
Sur Windows, Magitivisseur peut être reconnu comme un virus, ou alors une fenêtre "SmartScreen" apparaît

### Reconnu comme virus
Si l'exécutable est reconnu comme un virus, voici quelques solutions :
* Installer le dans un dossier, et configurer votre antivirus pour qu'il n'analyse pas les fichiers de ce dossier nouvellement crée
* Autoriser la "menace"
* Compiler vous-même le programme

### Fenêtre SmartScreen
L'application n'étant pas signée, une fenêtre "SmartScreen" apparaît pour vous prévenir que le logiciel peut potentiellement représentée une menace. Pour ignorer cet avertissement, veuillez cliquer sur "Informations complémentaires", puis "Exécuter quand même"

*Afin de signer une application, il faut un budget de 70 euros à 300 par an. Je n'ai pas ce budget*
# Compilation locale

__Prérequis__ : <br></br>
›› NodeJs (installez le et ajoutez-le à votre "**PATH**" pour + de simplicité)<br></br>
›› Git (si vous souhaitez cloner via le cli)

1. Installez le projet d'une de ces manières
	* `git clone https://github.com/firedyolo/Magitivisseur_PC.git`
	* Téléchargez le code source depuis l'onglet "**release**"
	* Téléchargez le code en archive .zip

2. Ouvrez un cmd et accéder à votre dossier dans lequel se trouve le code source à l'aide de la commande : cd votre/chemin/de/dossier

3. Utilisez la commande : `npm install`

4. Ensuite ouvrez le fichier `package.json` et modifiez la ligne `8` :
	* Pour Linux : `"build": "electron-builder -l"`
	* Pour Windows : `"build": "electron-builder -w"`
	* Pour Linux & Windows en même temps : `"build": "electron-builder -wl"`

> Pour une raison que j'ignore, il peut y avoir des problèmes à compiler l'exécutable pour Linux en utilisant une machine Windows

5. Le fichier exécutable est dans un dossier nommé `dist`

**Note:** Si vous souhaitez compiler pour une autre distribution linux, vous deviez modifier le fichier `package.json` > `build` >  `linux` > `target` avec le support voulu [voir +](https://www.electron.build/linux)

*Une version mobile du projet verra le jour dans quelques temps*

> En cas de questions, vous pouvez passer par les issues Github ou venir sur le [serveur Discord](https://discord.gg/S8Xf8Bc24g)

# Contribuer

Si vous souhaitez contribuer au projet, voici quelques pistes :

1. Programmer de nouvelles fonctionnalités
2. Signaler les bugs et autres problèmes (fuite de mémoire, problèmes de performances, etc...)
3. Traduire les différents textes en d'autres langues
4. Soutenir et contribuer aux autres projets mentionnés. Sans eux, Magitivisseur n'aurait jamais vu le jour