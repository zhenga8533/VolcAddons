// Import outer scope variables
import settings from "./settings";
// Settings change REMOVE NEXT UPDATE
if (settings.drawWaypoint === false || settings.drawWaypoint === true) {
    settings.drawWaypoint = 0;
}
import { data, updateList } from "./utils/variables";
import { AQUA, BOLD, GOLD, GRAY, GREEN, ITALIC, LOGO, RED, RESET, UNDERLINE, WHITE } from "./utils/constants";
data.autosave();

// General
import "./features/PartyCommands";
import { executeCommand } from "./features/PartyCommands";
import "./features/RemoveSelfie";
import "./features/JoinParty";
import "./features/DrawWaypoint";
import { NPCEdit, createWaypoint, enigmaEdit, zoneEdit } from "./features/DrawWaypoint";
import "./features/GyroTimer";
import "./features/ReminderTimer";
import "./features/HealthAlert";
import "./features/AutoTransfer";
import "./features/ChangeMessage";
import "./features/SkillTracker";
import "./features/ServerAlert";

// Hub
import "./features/DianaWaypoint";
import { setWarps } from "./features/DianaWaypoint";
import "./features/AnnouceMob";

// Crimson Isles
import "./features/BrokenHyp";
import "./features/GoldenFishTimer";
import "./features/VanqWarp";
import "./features/VanqCounter";
import "./features/AbiphoneBlocker";
import "./features/BazaarCalculator";
import { calculate, setApex } from "./features/BazaarCalculator";

// Kuudra
import "./features/KuudraAlerts";
import "./features/KuudraReparty";
import "./features/KuudraCrates";
import "./features/KuudraDetect";
import "./features/KuudraSplits";
import { getSplits } from "./features/KuudraSplits";
import "./features/RagDetect";

// Garden
import "./features/GardenTab";

// FIRST RUN
if (data.newUser) {
    ChatLib.chat(`\n${GOLD}${BOLD}${UNDERLINE}VolcAddons v${JSON.parse(FileLib.read("VolcAddons", "metadata.json")).version}${RESET}`);
    ChatLib.chat("LF GRAPES! (P.S. do /volcaddons, /volc, /va, /itee)");
    ChatLib.chat("Instruction manual (i think) => /va help or DM Volcaronitee#0233\n");

    data.newUser = false;
}

// NEW UPDATE
register("chat", () => {
    setTimeout(() => {
        if (JSON.parse(FileLib.read("VolcAddons", "metadata.json")).version != data.version) {
            data.version = JSON.parse(FileLib.read("VolcAddons", "metadata.json")).version;
            ChatLib.chat(`${LOGO} ${WHITE}${BOLD}LATEST UPDATE ${GRAY}[v${JSON.parse(FileLib.read("VolcAddons", "metadata.json")).version}]!`);
            ChatLib.chat("-Added skill xp tracker");
            ChatLib.chat("-Added slayer spawn waypoints");
            ChatLib.chat("-Added recent server alert");
            ChatLib.chat("-Changed kuudra splits to be more reliable");
            ChatLib.chat("-Fixed golden fish timer to 4.5 mins (ty @jasperazzi)");
            ChatLib.chat("-Configured some settings (you may need to re-enable some)");
            ChatLib.chat("-Organized some code (-500 lines)");
        }
    }, 1000);
}).setCriteria("Welcome to Hypixel SkyBlock!");

// HELP
function getHelp() {
    ChatLib.chat(`\n${GOLD}${BOLD}${UNDERLINE}VolcAddons v${JSON.parse(FileLib.read("VolcAddons", "metadata.json")).version}${RESET}\n`);
    
    // General Commands
    ChatLib.chat(`${AQUA}${BOLD}GENERAL COMMANDS:${RESET}`);
    ChatLib.chat(`${GRAY}${BOLD}Settings: ${RESET}/va <help, settings, clear ${ITALIC}(resets text settings)${RESET}>`);
    ChatLib.chat(`${GRAY}${BOLD}Waypoints: ${RESET}/va <coords, waypoint, enigma, npc, zone>`);
    ChatLib.chat(`${GRAY}${BOLD}Lists: ${RESET}/va <whitelist, blacklist, emotelist, blocklist, warplist>`);
    ChatLib.chat(`${GRAY}${BOLD}Kuudra: ${RESET}/va splits`);
    ChatLib.chat(`${RED}${BOLD}Inferno Minions: ${RESET}/va <calc, apex>\n`);

    // General Features
    ChatLib.chat(`${AQUA}${BOLD}GENERAL FEATURES:${RESET}`);
    ChatLib.chat(`${GRAY}${BOLD}Party Commands: ${RESET}?<warp, transfer, promote, demote, allinv>`);
    ChatLib.chat(`${GRAY}${BOLD}Other Commands: ${RESET}?<cringe, gay, racist, dice, flip, 8ball, rps, w>\n`);
    
    // Crimson Isle Features
    ChatLib.chat(`${AQUA}${BOLD}OTHER FEATURES:${RESET}`);
    ChatLib.chat(`Should be self explanatory, DM Volcaronitee#0233 on discord if any questions...`);
}

// GENERAL FUNCTION COMMANDS
const PARTY_COMMANDS = ["cringe", "gay", "racist", "dice", "roll", "coin", "flip", "coinflip", "cf", "8ball", "rps", "waifu", "w"];

register ("command", (...args) => {
    const command = args[0] == undefined ? undefined : args[0].toLowerCase();
    switch (command) {
        case undefined: // Settings
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
            settings.reminderText = "";
            ChatLib.chat(`${LOGO} ${GREEN}Successfully cleared all text property settings!`);
            break;
        case "coords": // sendcoords
        case "sendcoords":
        case "xyz":
            const id = (Math.random() + 1).toString(36).substring(7);
            ChatLib.say(`x: ${Math.round(Player.getX())}, y: ${Math.round(Player.getY())}, z: ${Math.round(Player.getZ())} @${id}`);
            break;
        // LIST CONTROLS
        case "whitelist":
        case "white":
        case "wl":
            updateList(args, data.whitelist, "white-list");
            break;
        case "blacklist":
        case "black":
        case "bl":
            updateList(args, data.blacklist, "black-list");
            break;
        case "emotelist":
        case "emote":
        case "el":
            updateList(args, data.emotelist, "emote-list");
            break;
        case "moblist":
        case "mob":
        case "ml":
            updateList(args, data.moblist, "mob-list");
            break;
        case "blocklist":
        case "block":
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
        case "apex": // Set Apex Price
            setApex(args);
            break;
        case "enigma": // Configure enigma souls
            enigmaEdit(args);
            break;
        case "npc": // Enable npc waypoints
            NPCEdit(args);
            break;
        case "zone": // Enable zone waypoints
            zoneEdit(args);
            break;
        default: // Else case
            if (PARTY_COMMANDS.includes(command))
                executeCommand(Player.getName(), args, false);
            else {
                ChatLib.chat(`${LOGO} ${RED}Unkown command: "${command}" was not found!`);
                ChatLib.chat(`${LOGO} ${RED}Use '/va help' for a full list of commands.`);
            }
            break;
    }
}).setName("volcaddons").setAliases("volc", "va", "itee")