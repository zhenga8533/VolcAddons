import { delay } from "./thread";


const Socket = Java.type("java.net.Socket");

class WebSocket {
    #socket;
    #output;
    #input;

    constructor() {
        this.connect();
    }
    
    connect(attempts = 0) {
        if (attempts > 9) {
            console.error("[VolcAddons] Failed to connect to socket server.");
            return;
        }

        console.log("[VolcAddons] Connecting to socket server...");

        try {
            this.#socket = new Socket("volca.dev", 3389);
        } catch (e) {
            console.error("[VolcAddons] Error connecting to socket server: " + e);
            delay(() => {
                this.connect(attempts + 1)
            }, 10000);
            return;
        }

        console.log("[VolcAddons] Connected to socket server.");

        this.#output = this.#socket.getOutputStream();
    }

    test() {
        
    }
}

// const socket = new WebSocket();
