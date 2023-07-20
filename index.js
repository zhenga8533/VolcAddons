// Util
import settings from "./settings";
if (settings.dungeonRejoin === true || settings.dungeonRejoin === false) settings.dungeonRejoin = 0;
import { AQUA, BOLD, CAT_SOULS, ENIGMA_SOULS, GOLD, GRAY, GREEN, ITALIC, LOGO, RED, RESET, UNDERLINE, WHITE } from "./utils/constants";
import { getInParty, getIsLeader } from "./utils/party";
import { data, opened, updateList } from "./utils/variables";
import { delay } from "./utils/thread";
import "./utils/waypoints";
import "./utils/worlds";
data.autosave();

// General
import "./features/general/AbiphoneBlocker";
import "./features/general/AutoTransfer";
import "./features/general/ChangeMessage";
import "./features/general/CoinTracker";
import { createWaypoint } from "./features/general/UserWaypoints";
import "./features/general/JoinParty";
import { executeCommand } from "./features/general/PartyCommands";
import "./features/general/ReminderTimer";
import "./features/general/RemoveSelfie";
import "./features/general/ServerAlert";
import "./features/general/SkillTracker";

// Combat
import "./features/combat/BrokenHyp";
import "./features/combat/DamageTracker";
import "./features/combat/GyroTimer";
import "./features/combat/HealthAlert";
import "./features/combat/RagDetect";
import "./features/combat/DungeonRejoin";
import "./features/combat/WatcherAlert";

// Mining
import "./features/mining/PowderTracker";

// Hub
import { setWarps } from "./features/hub/DianaWaypoint";

// Crimson Isles
import "./features/crimsonIsles/GoldenFishTimer";
import "./features/crimsonIsles/VanqWarp";
import "./features/crimsonIsles/VanqCounter";

// Kuudra
import "./features/kuudra/KuudraAlerts";
import "./features/kuudra/KuudraCrates";
import "./features/kuudra/KuudraDetect";
import "./features/kuudra/KuudraReparty";
import { getSplits } from "./features/kuudra/KuudraSplits";

// Garden
import { getNextVisitor } from "./features/garden/GardenTab";
import "./features/garden/GardenWarp";

// Rift
import "./features/rift/DDR";
import "./features/rift/TubaTimer";
import "./features/rift/VampireSlayer";

// Misc
import "./features/misc/AnnouceMob";
import { calculate, setApex } from "./features/misc/BazaarCalculator";
import { NPCEdit, soulEdit, zoneEdit } from "./features/rift/RiftWaypoints";
import { getTier, getWorld } from "./utils/worlds";

// FIRST RUN
if (data.newUser) {
    ChatLib.chat(`\n${GOLD}${BOLD}${UNDERLINE}VolcAddons v${JSON.parse(FileLib.read("VolcAddons", "metadata.json")).version}${RESET}`);
    ChatLib.chat("LF GRAPES! (P.S. do /volcaddons, /volc, /va, /itee)");
    ChatLib.chat("Instruction manual (i think) => /va help or DM 'grapefruited' on Discord!\n");

    data.newUser = false;
}

// NEW UPDATE
register("chat", () => {
    delay(() => {
        if (JSON.parse(FileLib.read("VolcAddons", "metadata.json")).version != data.version) {
            data.version = JSON.parse(FileLib.read("VolcAddons", "metadata.json")).version;
            ChatLib.chat(`${LOGO} ${WHITE}${BOLD}LATEST UPDATE ${GRAY}[v${JSON.parse(FileLib.read("VolcAddons", "metadata.json")).version}]!`);
            JSON.parse(FileLib.read("VolcAddons", "updates.json")).forEach(update => {
                ChatLib.chat(update);
            });
        }
    }, 1000);
}).setCriteria("Welcome to Hypixel SkyBlock${after}");

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
    ChatLib.chat(`Should be self explanatory, DM 'grapefruited' on discord if any questions...`);
}

// GENERAL FUNCTION COMMANDS
const PARTY_COMMANDS = ["cringe", "gay", "racist", "dice", "roll", "coin", "flip", "coinflip", "cf", "8ball", "rps", "waifu", "w"];

register ("command", (...args) => {
    if (args == undefined) {
        settings.openGUI();
        opened();
        return;
    }

    const command = args[0] == undefined ? undefined : args[0].toLowerCase();
    switch (command) {
        case undefined: // Settings
        case "settings":
            settings.openGUI();
            opened();
            break;
        case "help": // HELP
            getHelp();
            break;
        case "clear": // CLEAR ALL TEXT PROPERTIES IN SETTINGS
            settings.vanqParty = "";
            settings.kuudraRP = "";
            settings.kuudraCannonear = "";
            settings.kuudraStunner = "";
            settings.reminderText = "";
            ChatLib.chat(`${LOGO} ${GREEN}Successfully cleared all text property settings!`);
            break;
        case "coords": // Send Coords in Chat
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
            soulEdit(args, "enigma", "enigmaSouls", ENIGMA_SOULS);
            break;
        case "montezuma": // Configure enigma souls
        case "mont":
        case "cat":
            soulEdit(args, "cat", "catSouls", CAT_SOULS);
            break;
        case "npc": // Enable npc waypoints
            NPCEdit(args);
            break;
        case "zone": // Enable zone waypoints
            zoneEdit(args);
            break;
        case "test": // Testing (please work)
            ChatLib.chat("World: " + getWorld());
            ChatLib.chat("Tier: " + getTier());
            ChatLib.chat("Leader: " + getIsLeader());
            ChatLib.chat("Party: " + getInParty());
            ChatLib.chat("Garden: " + getNextVisitor());
            Client.Companion.showTitle("", `§6↑, ↑, ↓, ↓, ←, →, ←, →, B, A§r`, 0, 50, 0);
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
}).setName("volcaddons").setAliases("va", "volc", "itee");
