import { DARK_GRAY, GRAY, LOGO, RED } from "./Constants";
import Settings from "./Settings";
import { NonPooledThread, delay } from "./ThreadTils";

const Socket = Java.type("java.net.Socket");
const InputStreamReader = Java.type("java.io.InputStreamReader");
const BufferedReader = Java.type("java.io.BufferedReader");
const PrintWriter = Java.type("java.io.PrintWriter");

class WebSocket {
  #socket = null;
  #output;
  #input;
  #inputStream = [];

  // Condition variables
  #connected = false;
  #running = true;

  /**
   * Creates a new WebSocket connection.
   *
   * Sugar, spice, and everything nice.
   * These were the ingredients chosen to create the perfect little girl
   * But Professor Utonium accidentally added an extra ingredient to the concoction--
   * https://github.com/Soopyboo32/soopyApis/tree/master
   */
  constructor() {
    if (!Settings.socketToggle) return;

    console.log("[VolcAddons] Connecting to socket server...");
    new NonPooledThread(() => {
      this.connect();
    }).execute();
    this.expected = 0;

    // Send data to the server
    new NonPooledThread(() => {
      while (this.#running) {
        if (this.#connected && this.#socket !== null) {
          try {
            if (this.#inputStream.length > 0) {
              this.#inputStream.forEach((line) => {
                this.#input.println(line);
              });
              this.#inputStream = [];
            } else {
              Thread.sleep(1_000);
            }
          } catch (e) {
            this.disconnect();
            Thread.sleep(10_000);
          }
        } else {
          this.disconnect();
          Thread.sleep(10_000);
        }
      }
    }).execute();

    // Set registers
    register("gameUnload", () => {
      this.#running = false;
      this.disconnect();
    }).setPriority(Priority.HIGHEST);
  }

  /**
   * Returns whether the socket is connected.
   *
   * @returns {Boolean} - Whether the socket is connected.
   */
  getConnected() {
    return this.#connected;
  }

  /**
   * Connects to the socket server.
   *
   * @param {Number} attempts - The number of attempts to connect to the server.
   */
  connect(attempts = 0) {
    if (!this.#running) return;
    if (this.#connected || this.#socket !== null) {
      console.error("[VolcAddons] Already connected to socket server.");
      return;
    }

    if (attempts > 9) {
      console.error("[VolcAddons] Failed to connect to socket server after 10 attempts.");
      return;
    }

    // Attempt to connect to the socket server
    try {
      this.#socket = new Socket("volca.dev", 3389);
    } catch (e) {
      const time = 10_000 * Math.pow(1.5, attempts);
      console.error(
        `[VolcAddons] Error connecting to socket server: ${e}. Retrying in ${(time / 1_000).toFixed(2)} seconds...`
      );
      delay(() => {
        this.connect(attempts + 1);
      }, time);
      return;
    }
    this.#connected = true;
    this.expected = 0;
    console.log("[VolcAddons] Connected to socket server.");

    // Initialize input and output streams
    this.#output = this.#socket.getOutputStream();
    this.#input = new PrintWriter(this.#output, true);

    // Start the listener thread
    new NonPooledThread(() => {
      let input = this.#socket.getInputStream();
      let reader = new BufferedReader(new InputStreamReader(input));

      while (this.#connected && this.#socket !== null && this.#running) {
        try {
          let data = reader.readLine();
          if (data !== null) {
            this.receive(data);
          } else {
            this.disconnect();
            break;
          }
        } catch (e) {
          console.error("[VolcAddons] Error reading data from socket server: " + e);
          this.disconnect();
          break;
        }
      }
      this.disconnect();
    }).execute();
  }

  /**
   * Disconnects from the socket server.
   */
  disconnect() {
    new NonPooledThread(() => {
      if (!this.#connected || this.#socket === null) return;
      this.#connected = false;
      this.expected = 0;

      try {
        this.#input.println(`{ "command": "disconnect", "player": "${Player.getName()}" }`);
        this.#input.close();
        this.#output.close();
        this.#socket.close();
        this.#socket = null;
        console.log("[VolcAddons] Disconnected from socket server.");
      } catch (e) {
        console.error("[VolcAddons] Error disconnecting from socket server: " + e);
      }

      // Attempt reconnect
      Thread.sleep(10_000);
      if (this.#running) {
        console.log("[VolcAddons] Attempting to reconnect to socket server...");
        this.connect();
      }
    }).execute();
  }

  /**
   * Sends data to the server.
   *
   * @param {Object} data - The data to send to the server.
   */
  send(data) {
    data.player = Player.getName();
    if (data?.request === "get") {
      if (this.#socket === null) {
        ChatLib.chat(`${LOGO + RED}Socket server is not connected.`);
      }
      this.expected++;
    }

    const json = JSON.stringify(data);
    this.#inputStream.push(json);
  }

  /**
   * Receives data from the server.
   *
   * @param {String} json - The data received from the server.
   */
  receive(json) {
    if (!json.startsWith("{") || !json.endsWith("}") || this.expected === 0) return;

    this.expected--;
    callback(JSON.parse(json));
  }
}
export default new WebSocket();

/**
 * Run callback and prevent circular dependency.
 */
import { processAlloy, processEvent } from "../features/mining/EventTracker";

/**
 * Processes the event received from the server.
 *
 * @param {Object} data - The data received from the server.
 */
function callback(data) {
  const command = data.command;

  switch (command) {
    case "alloy":
      processAlloy(data);
      break;
    case "ch":
    case "dm":
      processEvent(data);
      break;
    default:
      ChatLib.chat(`${LOGO + DARK_GRAY}Received unknown command: ${GRAY + command}`);
  }
}
