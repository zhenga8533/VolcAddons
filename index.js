// Import outer scope variables
import settings from "./settings";
import { data, getWorld, updateList } from "./variables";
import { AQUA, BOLD, GOLD, GRAY, GREEN, ITALIC, RED, RESET, UNDERLINE, WHITE } from "./constants";

// General
import "./features/PartyCommands";
import "./features/RemoveSelfie";
import "./features/JoinWhitelist";
import "./features/DrawWaypoint";
import "./features/GyroTimer";
import "./features/ReminderTimer";
import { createWaypoint } from "./features/DrawWaypoint";
import "./features/JoinReparty";
import "./features/HealthAlert";

// Hub
import "./features/DianaWaypoint";
import { setWarps } from "./features/DianaWaypoint";
import "./features/AnnouceMob";

// Private Island
import "./features/BazaarCalculator";
import { calculate, setApex } from "./features/BazaarCalculator";

// Crimson Isles
import "./features/BrokenHyp";
import "./features/GoldenFishAlert";
import "./features/VanqWarp";
import "./features/VanqCounter";
import "./features/AbiphoneBlocker";

// Kuudra
import "./features/KuudraAlerts";
import "./features/KuudraReparty";
import "./features/KuudraCrates";
import "./features/KuudraHP";
import "./features/KuudraSplits";
import { getSplits } from "./features/KuudraSplits";
import "./features/RagDetect";

// Garden
import "./features/GardenTab";
import { executeCommand } from "./features/PartyCommands";

// TURN ON PERSISTANT DATA AUTOSAVE (POGOBJECT)
data.autosave();

// FIRST RUN
if (data.newUser) {
    ChatLib.chat("");
    ChatLib.chat(`${GOLD}${BOLD}${UNDERLINE}VolcAddons v${JSON.parse(FileLib.read("VolcAddons", "metadata.json")).version}${RESET}`);
    ChatLib.chat("Ya got any grapes? (P.S. do /volcaddons, /volc, /va, /itee)");
    ChatLib.chat("Instruction manual (i think) => /va help");
    ChatLib.chat("");

    data.newUser = false;
}

// NEW UPDATE
register("chat", () => {
    setTimeout(() => {
        if (JSON.parse(FileLib.read("VolcAddons", "metadata.json")).version != data.version) {
            data.version = JSON.parse(FileLib.read("VolcAddons", "metadata.json")).version;
            ChatLib.chat(`${GOLD}VolcAddons ${GRAY}> ${WHITE}${BOLD}LATEST UPDATE ${GRAY}[v${JSON.parse(FileLib.read("VolcAddons", "metadata.json")).version}]!`);
            ChatLib.chat("-Added Gyro timer");
            ChatLib.chat("-Added time stamps in /va splits")
            ChatLib.chat("-Added randomized letters to end of coords in all chat (don't get muted :])")
            ChatLib.chat("-Added /va coords with ^, same format as patcher");
            ChatLib.chat("-Fixed error in fetching sell price in /va calc\n");
        }
    }, 1000);
}).setCriteria("Welcome to Hypixel SkyBlock!");

// HELP
function getHelp() {
    ChatLib.chat(`\n${GOLD}${BOLD}${UNDERLINE}VolcAddons v${JSON.parse(FileLib.read("VolcAddons", "metadata.json")).version}${RESET}\n`);
    
    // General Commands
    ChatLib.chat(`${AQUA}${BOLD}GENERAL COMMANDS:${RESET}`);
    ChatLib.chat(`${GRAY}${BOLD}Settings: ${RESET}/va <help, settings, clear ${ITALIC}(resets text settings)${RESET}>`);
    ChatLib.chat(`${GRAY}${BOLD}Waypoints: ${RESET}/va waypoint <name> <x> <y> <z>`);
    ChatLib.chat(`${GRAY}${BOLD}User Lists: ${RESET}/va <wl, bl, warp> <add, remove> <ign> | clear | view`);
    ChatLib.chat(`${GRAY}${BOLD}Splits: ${RESET}/va <splits, average <#, party>, best, clear>`);
    ChatLib.chat(`${RED}${BOLD}Inferno Minions:${RESET}`);
    ChatLib.chat(`/va calculate <hypergolic, inferno ${ITALIC}<minions> <tier>${RESET}>`);
    ChatLib.chat(`/va apex <price>\n`);

    // General Features
    ChatLib.chat(`${AQUA}${BOLD}GENERAL FEATURES:${RESET}`);
    ChatLib.chat(`${GRAY}${BOLD}Party Commands: ${RESET}?<warp, transfer, promote, demote, allinv>`);
    ChatLib.chat(`${GRAY}${BOLD}Other Commands: ${RESET}?<cringe, gay, dice, flip, 8ball>\n`);
    
    // Crimson Isle Features
    ChatLib.chat(`${AQUA}${BOLD}OTHER FEATURES:${RESET}`);
    ChatLib.chat(`Should be self explanatory, DM Volcaronitee#0233 on discord if any questions...`);
}

// GENERAL FUNCTION COMMANDS
const PARTY_COMMANDS = ["cringe", "gay", "racist", "dice", "roll", "coin", "flip", "coinflip", "cf", "8ball", "rps", "waifu", "w"];

register ("command", (...args) => {
    const command = args[0] == undefined ? undefined : args[0].toLowerCase();
    switch (command) {
        case undefined: // HELP
            settings.openGUI();
            break;
        case "help": // HELP
            getHelp();
            break;
        case "settings": // SETTINGS
            settings.openGUI();
            break;
        case "clear": // CLEAR ALL TEXT PROPERTIES IN SETTINGS
            settings.vanqParty = "";
            settings.kuudraRP = "";
            settings.kuudraCannonear = "";
            settings.kuudraStunner = "";
            ChatLib.chat(`${GREEN}Successfully cleared all text property settings!`);
            break;
        case "coords": // sendcoords
        case "sendcoords":
            const id = (Math.random() + 1).toString(36).substring(7);
            ChatLib.say(`x: ${Math.round(Player.getX())}, y: ${Math.round(Player.getY())}, z: ${Math.round(Player.getZ())} @${id}`);
            break;
        case "whitelist": // ADD / REMOVE USER FROM WHITELIST
        case "white":
        case "wl":
            updateList(args, data.whitelist, "white-list");
            break;
        case "blocklist":
        case "block":
        case "bl":
            updateList(args, data.blocklist, "block-list");
            break;
        case "warplist":
        case "warp":
            updateList(args, data.warplist, "warp-list");
            setWarps();
            break;
        case "splits": // KUUDRA SPLITS
        case "split":
            getSplits(args);
            break;
        case "waypoints": // WAYPOINT MAKER
        case "waypoint":
            createWaypoint(args);
            break;
        case "calculate": // BAZAAR CALCULATOR
        case "calc":
            calculate(args);
            break;
        case "apex":
            setApex(args);
            break;
        case "world":
            ChatLib.chat(getWorld());
            break;
        case "moblist":
        case "mob":
        case "ml":
            updateList(args, data.moblist, "mob-list");
            break;
        default: // ELSE CASE -> SETTINGS
            if (PARTY_COMMANDS.includes(command))
                executeCommand(Player.getName(), args, false);
            else
                settings.openGUI();
            break;
    }
}).setName("volcaddons").setAliases("volc", "va", "itee")