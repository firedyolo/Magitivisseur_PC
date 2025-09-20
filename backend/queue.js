import { EventEmitter } from "node:events";
import { playlistQueue } from "../main.js";

const handleQueue = new EventEmitter();

handleQueue.on("add", (data) => {
    console.log(data);
});

export { handleQueue }