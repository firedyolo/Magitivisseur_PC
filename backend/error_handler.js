import { dialog, nativeImage } from "electron/main";

class Bug {
    constructor(bug_Data) {        
        this.detail = bug_Data.detail ?? "";
        this.message = bug_Data.message ?? "Message d'erreur indisponible";
        this.title = bug_Data.title ?? "Error";            
        this.type = bug_Data.type ?? "error";
    }

    returnBugData() {
        let logIcon;
        const platform = process.platform;   
        
        if (platform === "linux") {
            const base = "/img/icons/win";

            if (this.type === "error") logIcon = nativeImage.createFromPath(`${base}/erreur-01.ico`);
            if (this.type === "warning") logIcon = nativeImage.createFromPath(`${base}/erreur-01.ico`);
            if (this.type === "info") logIcon = nativeImage.createFromPath(`${base}/erreur-01.ico`);
        }

        if (platform === "linux") {
            const base = "/img/icons/linux";
            
            if (this.type === "error") logIcon = nativeImage.createFromPath(`${base}/erreur-01.png`);
            if (this.type === "warning") logIcon = nativeImage.createFromPath(`${base}/warning-01.png`);
            if (this.type === "info") logIcon = nativeImage.createFromPath(`${base}/info-01.png`);
        }

        return {
            detail: this.detail,
            message: this.message,
            title: this.title,
            type: this.type,
            icon: logIcon
        }
    }

    handleBug() {        
        dialog.showMessageBox(this.returnBugData());
    }
}

export { Bug }