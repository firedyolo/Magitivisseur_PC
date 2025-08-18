import { dialog } from "electron/main";

class Bug {
    constructor(bugData) {        
        this.detail = bugData.detail ?? "";
        this.message = bugData.message ?? "Message d'erreur indisponible";
        this.title = bugData.title ?? "Error";            
        this.type = bugData.type ?? "error";
    }

    returnBugData() {
        return {
            detail: this.detail,
            message: this.message,
            title: this.title,
            type: this.type,
        }
    }

    handleBug() {        
        dialog.showMessageBox(this.returnBugData());
    }
}

export { Bug }