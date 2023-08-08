// Utility Modules
import settings from "./settings";
if (settings.partyCommands === true || settings.partyCommands === false) settings.partyCommands = 0;
import { AQUA, BOLD, CAT_SOULS, ENIGMA_SOULS, GOLD, GRAY, GREEN, ITALIC, LOGO, RED, RESET, RIFT_NPCS, RIFT_ZONES, UNDERLINE, WHITE } from "./utils/constants";
import { openGUI } from "./utils/overlay";
import { getInParty, getIsLeader } from "./utils/party";
import "./utils/player";
import { delay } from "./utils/thread";
import "./utils/updates";
import { data, opened, updateList } from "./utils/variables";
import "./utils/waypoints";
import { findZone, getTier, getWorld } from "./utils/worlds";
data.autosave();

// General Features
import "./features/general/AbiphoneBlocker";
import "./features/general/AutoTransfer";
import "./features/general/ChangeMessage";
import "./features/general/JoinParty";
import { executeCommand } from "./features/general/PartyCommands";
import "./features/general/ReminderTimer";
import "./features/general/RemoveSelfie";
import "./features/general/ServerAlert";
import "./features/general/SkillTracker";
import "./features/general/Status";
import { createWaypoint } from "./features/general/UserWaypoints";
// Economy Features
import "./features/economy/CoinTracker";
import "./features/economy/Economy";
import "./features/economy/ItemPrice";
import { calcMinions } from "./features/economy/MinionCalc";
// Combat Features
import { getBestiary } from "./features/combat/Bestiary";
import "./features/combat/BrokenHyp";
import "./features/combat/DamageTracker";
import "./features/combat/DungeonRejoin";
import "./features/combat/EntityDetect";
import "./features/combat/GyroTimer";
import "./features/combat/HealthAlert";
import "./features/combat/RagDetect";
import "./features/combat/SlayerDetect";
import "./features/combat/WatcherAlert";
// Mining Features
import "./features/mining/PowderTracker";
// Hub Features
import { setWarps } from "./features/hub/DianaWaypoint";
import "./features/hub/InquisitorCounter";
import "./features/hub/InquisitorDetect";
// Crimson Isle Features
import "./features/crimsonIsle/GoldenFishTimer";
import "./features/crimsonIsle/MythicDetect";
import "./features/crimsonIsle/VanqCounter";
import "./features/crimsonIsle/VanqDetect";
import "./features/crimsonIsle/VanqWarp";
// Kuudra Features
import { getAttributes } from "./features/kuudra/AttributePricing";
import "./features/kuudra/KuudraAlerts";
import "./features/kuudra/KuudraCrates";
import "./features/kuudra/KuudraDetect";
import "./features/kuudra/KuudraProfit";
import { getSplits } from "./features/kuudra/KuudraSplits";
// Garden Features
import { calcCompost } from "./features/garden/ComposterCalc";
import { getNextVisitor } from "./features/garden/GardenTab";
import "./features/garden/GardenWarp";
// Rift Features
import "./features/rift/DDR";
import "./features/rift/TubaTimer";
import "./features/rift/VampireSlayer";
import { riftWaypointEdit, soulEdit } from "./features/rift/RiftWaypoints";


const once = register("worldLoad", () => {
    // FIRST RUN - Display welcome message for new users
    if (data.newUser) {
        ChatLib.chat(`\n${GOLD}${BOLD}${UNDERLINE}VolcAddons v${JSON.parse(FileLib.read("VolcAddons", "metadata.json")).version}${RESET}`);
        ChatLib.chat("LF GRAPES! (P.S. do /volcaddons, /volc, /va, /itee)");
        ChatLib.chat("Instruction manual (i think) => /va help or DM 'grapefruited' on Discord!\n");
    
        data.newUser = false; // Marking that the user is no longer new
    }

    // NEW UPDATE - Display update message when a new version is detected
    delay(() => {
        if (JSON.parse(FileLib.read("VolcAddons", "metadata.json")).version != data.version) {
            data.version = JSON.parse(FileLib.read("VolcAddons", "metadata.json")).version;
            ChatLib.chat(`\n${LOGO} ${WHITE}${BOLD}LATEST UPDATE ${GRAY}[v${JSON.parse(FileLib.read("VolcAddons", "metadata.json")).version}]!`);
            JSON.parse(FileLib.read("VolcAddons", "changelog.json")).forEach(change => {
                ChatLib.chat(change);
            });
            ChatLib.chat();
        }
    }, 1000);
    once.unregister();
});

// HELP - Display help message for available commands
function getHelp() {
    ChatLib.chat(`\n${GOLD}${BOLD}${UNDERLINE}VolcAddons v${JSON.parse(FileLib.read("VolcAddons", "metadata.json")).version}${RESET}\n`);
    
    // General Commands
    ChatLib.chat(`${AQUA}${BOLD}GENERAL COMMANDS:${RESET}`);
    ChatLib.chat(`${GRAY}${BOLD}Settings: ${RESET}/va <help, settings, gui, clear ${ITALIC}(resets text settings)${RESET}>`);
    ChatLib.chat(`${GRAY}${BOLD}Waypoints: ${RESET}/va <coords, waypoint, clear, enigma, npc, zone>`);
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

// GENERAL FUNCTION COMMANDS - Handling command inputs
const PARTY_COMMANDS = new Set(["cringe", "gay", "racist", "dice", "roll", "coin", "flip", "coinflip", "cf", "8ball", "rps", "waifu", "w"]);
register ("command", (...args) => {
    if (args === undefined) {
        settings.openGUI();
        opened();
        return;
    }

    // Parsing command and executing appropriate actions
    const command = args[0] === undefined ? undefined : args[0].toLowerCase();
    switch (command) {
        // Settings
        case undefined:
        case "settings":
            settings.openGUI();
            opened();
            break;
        // Help
        case "help":
            getHelp();
            break;
        // Move GUI
        case "gui":
            openGUI();
            break;
        // Clear setting text properties
        case "clear":
            settings.vanqParty = "";
            settings.kuudraRP = "";
            settings.kuudraCannonear = "";
            settings.kuudraStunner = "";
            settings.reminderText = "";
            ChatLib.chat(`${LOGO} ${GREEN}Successfully cleared all text property settings!`);
            break;
        // Set API key
        case "api": 
            if (args[1]) {
                settings.apiKey = args[1]
                ChatLib.chat(`${LOGO} ${GREEN}Succesfully set API key as ${settings.apiKey}!`);
            } else
                ChatLib.chat(`${LOGO} ${RED}Please input as /va api [key]!`);
            break;
        // Testing (please work)
        case "test":
            ChatLib.chat("World: " + getWorld());
            ChatLib.chat("Zone: " + findZone());
            ChatLib.chat("Tier: " + getTier());
            ChatLib.chat("Leader: " + getIsLeader());
            ChatLib.chat("Party: " + getInParty());
            ChatLib.chat("Garden: " + getNextVisitor());
            break;
        // Send Coords in Chat
        case "coords":
        case "sendcoords":
        case "xyz":
            const id = (Math.random() + 1).toString(36).substring(7);
            ChatLib.say(`x: ${Math.round(Player.getX())}, y: ${Math.round(Player.getY())}, z: ${Math.round(Player.getZ())} @${id}`);
            break;
        // Bestiary Stuff
        case "be":
        case "bestiary":
            getBestiary(args);
            break;
        // Attribute Pricing
        case "attribute":
        case "attributes":
            getAttributes(args);
            break;
        // List Controls
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
        // Kuudra Splits
        case "splits": // Kuudra splits
        case "split":
            getSplits(args);
            break;
        // User Waypoints
        case "waypoints":
        case "waypoint":
        case "wp":
            createWaypoint(args);
            break;
        // Shh
        case "extrasensory":
            if (!isNaN(args[1])) {
                data.y = args[1];
                ChatLib.chat(`${LOGO} ${GREEN}Succesfully set ESP y-value to ${args[1]}!`)
            }
            break;
        // Bazaar Calculations
        case "calculate":
        case "calc":
            switch(args[1]) {
                case "composter":
                case "compost":
                    calcCompost(args);
                    break;
                case "hypergolic":
                case "hg":
                case "inferno":
                case "gabagool":
                case "gaba":
                case "vampire":
                case "vamp":
                    calcMinions(args);
                    break;
                default:
                    ChatLib.chat(`${LOGO} ${AQUA}Please enter as /va calc <hypergolic, inferno, gabagool, vampire, compost>${AQUA}>`);
                    break;
            }
            break;
        // Set Apex Price
        case "apex":
            data.apexPrice = isNaN(args[1]) ? data.apexPrice : args[1];
            ChatLib.chat(`${LOGO} ${GREEN}Successfully changed Apex price to ${formatInt(data.apexPrice)}!`);
            break;
        // Configure enigma souls
        case "enigma":
            soulEdit(args, "enigma", "enigmaSouls", ENIGMA_SOULS);
            break;
        // Configure enigma souls
        case "montezuma":
        case "mont":
        case "cat":
            soulEdit(args, "cat", "catSouls", CAT_SOULS);
            break;
        // Configure npc waypoints
        case "npc":
            riftWaypointEdit(args, "npc", RIFT_NPCS);
            break;
        // Configure zone waypoints
        case "zone":
            riftWaypointEdit(args, "zone", RIFT_ZONES);
            break;
        // Party Commands and Else Case
        default:
            if (PARTY_COMMANDS.has(command))
                executeCommand(Player.getName(), args, false);
            else {
                ChatLib.chat(`${LOGO} ${RED}Unkown command: "${command}" was not found!`);
                ChatLib.chat(`${LOGO} ${RED}Use '/va help' for a full list of commands.`);
            }
            break;
    }
}).setName("volcaddons").setAliases("va", "volc", "itee");
