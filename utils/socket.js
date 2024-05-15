import { NonPooledThread, delay } from "./thread";


const Socket = Java.type("java.net.Socket");
const InputStreamReader = Java.type("java.io.InputStreamReader");
const BufferedReader = Java.type("java.io.BufferedReader");
const PrintWriter = Java.type("java.io.PrintWriter");

class WebSocket {
    #socket = null;
    #outputStream = [];
    #output;
    #input;

    // Condition variables
    #connected = false;
    #running = true;

    constructor() {
        register("gameUnload", this.disconnect);
        if (this.connect()) {
            // Send data to the server
            new NonPooledThread(() => {
                while (this.#running) {
                    if (this.#connected && this.#socket !== null) {
                        if (this.#outputStream.length > 0) {
                            for (let line of this.#outputStream) {
                                this.#input.println(line);
                            }
                            this.#outputStream = [];
                        } else {
                            Thread.sleep(1_000);
                        }
                    } else {
                        Thread.sleep(10_000);
                    }
                }
    
                this.#input.println('{ "command": "disconnect" }');
            }).execute();
        } else {
            console.error("[VolcAddons] Failed to connect to socket server.");
        }
    }
    
    connect(attempts = 0) {
        if (attempts > 9) {
            console.error("[VolcAddons] Failed to connect to socket server after 10 attempts.");
            return;
        }

        // Attempt to connect to the socket server
        console.log("[VolcAddons] Connecting to socket server...");
        try {
            this.#socket = new Socket("volca.dev", 3389);
        } catch (e) {
            console.error("[VolcAddons] Error connecting to socket server: " + e);
            delay(() => {
                this.connect(attempts + 1);
            }, 10000);
            return false;
        }
        this.#connected = true;
        console.log("[VolcAddons] Connected to socket server.");
        
        // Initialize input and output streams
        this.#output = this.#socket.getOutputStream();
        this.#input = new PrintWriter(this.#output, true);

        // Start the listener thread
        try {
            new NonPooledThread(() => {
                let input = this.#socket.getInputStream();
                let reader = new BufferedReader(new InputStreamReader(input));
                let shouldCont = true;

                while (this.#connected && this.#socket !== null && this.#running && shouldCont) {
                    try {
                        let data = reader.readLine();
                        if (data) {
                            this.receive(data);
                        }
                    } catch (e) {
                        shouldCont = false;
                        console.log("[VolcAddons] Error reading data from socket server: " + e);
                        this.disconnect();
                        Thread.sleep(5000);

                        console.log("[VolcAddons] Attempting to reconnect to the server...");
                        this.connect();
                    }
                }
                
                if (this.#connected && shouldCont) {
                    Thread.sleep(1000);
                    console.log("[VolcAddons] Attempting to reconnect to the server...");
                    this.connect();
                }
            }).execute();
        } catch (e) {
            console.error("[VolcAddons] Error starting listener thread: " + e);
            this.disconnect();
            return false;
        }

        return true;
    }

    disconnect() {
        if (this.#socket) {
            try {
                this.#socket.close();
                this.#socket = null;
                this.connected = false;
                console.log("[VolcAddons] Disconnected from socket server.");
            } catch (e) {
                console.error("[VolcAddons] Error disconnecting from socket server: " + e);
            }
        }
    }

    send(data) {
        if (!this.#socket) return;

        try {
            this.#outputStream.push(JSON.stringify(data));
        } catch (e) {
            console.error("[VolcAddons] Error sending data to socket server: " + e);
        }
    }

    receive(data) {
        console.log("[VolcAddons] Received data from socket server: " + data);
    }
}

/**
const socket = new WebSocket();

delay(() => {
    socket.send({ "command": "test" });
}, 5000);
*/
