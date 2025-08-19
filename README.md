# Magitivisseur
Un convertisseur Youtube **fiable**, **gratuit**, **sans pub** et ***open source*** ! :)

## Informations

Ce projet utilise **[electronjs](https://www.electronjs.org/)**, 
**[electron-builder](https://www.electron.build/)**, 
**[NodeJs](https://nodejs.org/fr)**, 
**[youtubejs](https://github.com/LuanRT/YouTube.js/)**, 
et **[homoglyph-search](https://github.com/codebox/homoglyph)**

## **/!\ IMPORTANT - Faux positif /!\\**
Sur Windows, Magitivisseur peut être reconnu comme un virus, ou alors une fenêtre "SmartScreen" apparaît

### Reconnu comme virus
Si l'exécutable est reconnu comme un virus, voici quelques solutions :
* Installer le dans un dossier, et configurer votre antivirus pour qu'il n'analyse pas les fichiers de ce dossier nouvellement crée
* Autoriser la "menace"
* Builder vous-même le programme

### Fenêtre SmartScreen
L'application n'étant pas signée (*pour signer une application, on parle de 70 euros à 300 par an, je n'ai pas ce budget*), une fenêtre "SmartScreen" apparaît pour vous prévenir que le logiciel peut potentiellement représentée une menace. Pour ignorer cet avertissement, veuillez cliquer sur "Informations complémentaires", puis "Exécuter quand même"

## Compilation locale

__Prérequis__ : 
›› NodeJs (installer le et rendez-le accessible partout sur votre appareil pour + de simplicité) \n <br></br>
›› Git (si vous souhaiter cloner via le cli)

1. Installer le projet d'une de ces manières
* git clone https://github.com/firedyolo/Magitivisseur_PC.git
* téléchargement du code source depuis l'onglet "release"
* ou encore télécharger le code en archive .zip
2. Ouvrez un cmd et accéder à votre dossier dans lequel se trouve le code source à l'aide de la commande : cd votre/chemin/de/dossier
3. Utilisez la commande : npm install
4. Ensuite ouvrez le fichier `package.json` et modifiez la ligne `8` :
* Pour Linux : `"build": "electron-builder -l"`
* Pour Windows : `"build": "electron-builder -w"`
* Pour Linux & Windows en même temps : `"build": "electron-builder -wl"`

<sub>Pour une raison que j'ignore, il peut y avvoir des problèmes à build l'exécutable pour Linux sous Windows</sub>
5. Le fichier exécutable est dans un dossier nommé `dist`

**Note:** Si vous souhaitez compiler pour une autre distribution linux, vous deviez modifier le fichier `package.json` > `build` >  `linux` > `target` avec le support voulu [voir +](https://www.electron.build/linux)

<sub>Une version mobile du projet verra le jour dans quelques temps</sub>

> En cas de questions, vous pouvez passer par les issues Github ou venir sur le [serveur Discord](https://discord.gg/S8Xf8Bc24g)