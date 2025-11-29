import { app } from "electron/main";
import { window } from "../main.js";
import path from 'node:path';

class Bug {
    constructor(bug_Data) {        
        this.detail = bug_Data.detail ?? "";
        this.message = bug_Data.message ?? "Message d'erreur indisponible";
        this.title = bug_Data.title ?? "Error";            
        this.type = bug_Data.type ?? "error";
    }

    returnBugData() {        
        let logIcon;

        if (app.isPackaged) {
            const icons_path = path.join(process.resourcesPath, "frontend/icons");
            if (this.type === "error") logIcon = path.join(icons_path, "erreur-01.png");
            if (this.type === "warning") logIcon = path.join(icons_path, "warning-01.png");
            if (this.type === "info") logIcon = path.join(icons_path, "information-01.png");
        }
                    
        else {
            if (this.type === "error") logIcon = "frontend/icons/erreur-01.png";
            if (this.type === "warning") logIcon = "frontend/icons/warning-01.png";
            if (this.type === "info") logIcon = "frontend/icons/information-01.png";
        }

        return {
            detail: this.detail,
            message: this.message,
            title: this.title,
            type: this.type,
            icon_path: logIcon
        }
    }

    sendBug() {      
        window.webContents.send('errorInfos', this.returnBugData());
    }
}

export { Bug }