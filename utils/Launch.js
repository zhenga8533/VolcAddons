import Settings from "./Settings";
import socket from "./Socket";
import { BOLD, GOLD, GRAY, LOGO, RESET, UNDERLINE, WHITE } from "./Constants";
import { delay } from "./ThreadTils";


// Create the necessary directories and files for the module to work
if (!FileLib.exists("VolcAddons", "data")) new java.io.File("config/ChatTriggers/modules/VolcAddons/Data").mkdir();
if (!FileLib.exists("VolcAddons", "data/contract.txt"))
    FileLib.write("VolcAddons", "data/contract.txt", FileLib.read("VolcAddons", "assets/contract.txt"));

// Utility Variable Control
const CHANGED_SETTINGS = new Set(["itemPrice", "bossAlert", "miniAlert", "vanqCounter"]);
for (const key in Settings) if (CHANGED_SETTINGS.has(key) && typeof Settings[key] !== "number") Settings[key] = 0;
if (typeof Settings.partyCommands !== "boolean") Settings.partyCommands = false;

// First Run
const version = JSON.parse(FileLib.read("VolcAddons", "metadata.json")).version;
const once = register("worldLoad", () => {
    once.unregister();
    delay(() => {
        // NEW UPDATE - Display update message when a new version is detected
        if (version != data.version) {
            data.version = JSON.parse(FileLib.read("VolcAddons", "metadata.json")).version;
            ChatLib.chat(`\n${LOGO + WHITE + BOLD}LATEST UPDATE ${GRAY}[v${JSON.parse(FileLib.read("VolcAddons", "metadata.json")).version}]!`);
            JSON.parse(FileLib.read("VolcAddons", "changelog.json")).forEach(change => ChatLib.chat(change));
            ChatLib.chat("");
        }

        // FIRST RUN - Display welcome message for new users
        if (data.newUser) {
            ChatLib.chat(
`\n${GOLD + BOLD + UNDERLINE}VolcAddons v${JSON.parse(FileLib.read("VolcAddons", "metadata.json")).version + RESET}
LF GRAPES! (P.S. do /volcaddons, /volc, /va, /itee)
Instruction manual (i think) => /va help\n`);
            data.newUser = false;
        }
    }, 1000);
});

// Track unique users
socket.send({
    "command": "user",
    "version": version,
});

