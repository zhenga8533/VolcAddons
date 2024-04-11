import PogObject from "../../PogData";
import settings from "./settings";
import { AQUA, CAT_SOULS, DARK_AQUA, DARK_GRAY, ENIGMA_SOULS, FAIRY_SOULS, GOLD, GRAY, GREEN, LOGO, RED, WHITE, YELLOW } from "./constants";
import { delay } from "./thread";


const DEFAULT_GUI = {
    "AL": [780, 430, 1.2, false, false], // Skill Tracker Location
    "BL": [10, 120, 1.2, false, false], // Vampire Location
    "CL": [10, 180, 1.2, false, false], // Counter Location
    "DL": [10, 180, 1.2, false, false], // Broodmother Location
    "EL": [100, 150, 1.1, false, false], // Advanced Value Location
    "FL": [220, 10, 1.2, false, false], // Trophy Fish Location
    "GL": [10, 140, 1.2, false, false], // Gyro Location
    "HL": [10, 240, 1.2, false, false], // Powder Chest Location
    "IL": [10, 180, 1.2, false, false], // Inq Location
    "JL": [150, 180, 1.2, false, false], // Kill Counter Location
    "KL": [600, 220, 1.2, false, false], // Kuudra Profit Location
    "LL": [770, 70, 1.2, false, false], // Server Status Location
    "ML": [780, 390, 1.2, false, false], // Coins Location
    "OL": [10, 130, 1.2, false, false], // Composter Location
    "PL": [10, 100, 1.2, false, false], // Powder Location
    "QL": [250, 225, 4, false, false], // Vanquisher Location
    "RL": [600, 175, 1, false, false], // Container Value Location
    "SL": [10, 180, 1.2, false, false], // Splits Location
    "TL": [10, 130, 1.2, false, false], // Golden Fish Timer Location
    "UL": [930, 65, 1.2, false, false], // Armor Display Location
    "VL": [10, 180, 1.2, false, false], // Visitors Location
    "WL": [730, 130, 1.2, false, false], // Wolf Combo Location
    "XL": [Renderer.screen.getWidth()/2 - 96, Renderer.screen.getHeight()*6/7, 1, false, false], // Searchbox location
    "YL": [770, 170, 1.2, false, false], // SkyBlock Stats Location
    "ZL": [780, 330, 1.2, false, false], // Kuudra Profit Tracker Location
    "BCL": [180, 10, 1, false, false], // Bingo Card Location
    "BTL": [110, 180, 1.2, false, false], // Bestiary Tab Location
    "CDL": [190, 115, 1.2, false, false], // Commission Display Location
    "CEL": [375, 275, 3, false, false], // Crate edit location
    "EQL": [905, 65, 1.2, false, false], // Equipment Location
    "PHL": [170, 160, 1.2, false, false], // Pesthunter Location
    "SDL": [170, 180, 1.2, false, false], // Spray Display Location
    "TVL": [600, 150, 1.2, false, false], // Trade Value Location
}

// --- PERSISTENT DATA ---
export let data = new PogObject("VolcAddons", {
    // Properties with default values for various settings and data
    "newUser": true,
    "version": "2.3.1",
    "commands": {},
    "wordbank": {},
    "lastID" : undefined,
    "world": "none",
    "tier": 0,
    "pet": undefined,
    "lastMsg": "joe",
    "vision": false,
    "uuid": undefined,
    "ign": undefined,
    // playtime tracking
    "playtime": 0,
    "lastDay": 0,
    // lists
    "whitelist": [],
    "blacklist": [],
    "dianalist": ["hub", "da", "castle", "museum", "wizard"],
    "moblist": [],
    "colorlist": {},
    "emotelist": {},
    "cdlist": {},
    "valuelist": {},
    "spamlist": [],
    "ignorelist": [],
    "attributelist": ["breeze", "dominance", "fortitude", "lifeline", "magic_find", "mana_pool", "mana_regeneration", "mending", "speed", "veteran", "blazing_fortune", 
        "fishing_experience"],
    // kuudra splits stuff
    "files": [],
    "splits": {
        "last": [0, 0, 0, 0, 0],
        "best": [999, 999, 999, 999, 9999],
        "worst": [0, 0, 0, 0, 0],
    },
    // tracker data
    "vanqSession": {
        "vanqs": 0,
        "kills": 0,
        "last": 0,
        "average": 0,
    },
    "inqSession": {
        "inqs": 0,
        "burrows": 0,
        "last": 0,
        "average": 0,
    },
    "kuudraSession": {
        "profit": 0,
        "chests": 0,
        "average": 0,
        "time": 0,
        "rate": 0
    },
    // economy calculation stuff
    "composterUpgrades": {
        "Composter Speed": -1,
        "Multi Drop": -1,
        "Cost Reduction": -1
    },
    "apexPrice": 2e9,
    // control keys
    "dianaKey": 0,
    "pauseKey": 0,
    "devKey": 0,
    "bindKey": 0,
    "chunkey": 0,
    "slotBinds": {},
    "bindPresets": {},
    // GUI locations
    ...DEFAULT_GUI,
    // Rift waypoint properties
    "fairySouls": FAIRY_SOULS,
    "enigmaSouls": ENIGMA_SOULS,
    "catSouls": CAT_SOULS
}, "datitee.json");

// --- GUI CONTROL ---
export function resetGUI() {
    Object.keys(DEFAULT_GUI).forEach(overlay => {
        data[overlay] = DEFAULT_GUI[overlay];
    });
}

// --- TRIGGER CONTROL ---

// An array to store registered triggers and their dependencies
let registers = [];

/**
 * Adds a trigger with its associated dependency to the list of registered triggers.
 * Credit to: https://www.chattriggers.com/modules/v/BloomCore for idea
 *
 * @param {Object} trigger - The trigger to be added.
 * @param {Function} dependency - The function representing the dependency of the trigger.
 */
export function registerWhen(trigger, dependency) {
    trigger.unregister();
    registers.push([trigger, dependency, false]);
}

// Updates trigger registrations based on world or GUI changes
export function setRegisters(off = false) {
    registers.forEach(trigger => {
        if (off || (!trigger[1]() && trigger[2])) {
            trigger[0].unregister();
            trigger[2] = false;
        } else if (trigger[1]() && !trigger[2]) {
            trigger[0].register();
            trigger[2] = true;
        }
    });
}
delay(() => setRegisters(off = settings.skyblockToggle && !Scoreboard.getTitle().removeFormatting().includes("SKYBLOCK")), 1000);

// Event handler for GUI settings close.
register("guiClosed", (event) => {
    if (!event.toString().includes("vigilance")) return;

    setRegisters(off = settings.skyblockToggle && !Scoreboard.getTitle().removeFormatting().includes("SKYBLOCK"));
    updateEntityList();
});


// --- LIST CONTROL ---
import { convertToPascalCase, convertToTitleCase, unformatNumber } from "./functions/format";
import { updateAuction } from "../features/economy/Economy";
import { updateEntityList } from "../features/combat/EntityDetect";
import { setWarps } from "../features/event/MythRitual";


let lines = [5858, 5859];
/**
 * Updates a list based on the provided arguments.
 *
 * @param {Array} args - An array of arguments provided for the list update.
 * @param {String[]} list - The list to be updated.
 * @param {String} listName - The name of the list for displaying messages.
 * @returns {String[]} - The updated list.
 */
export function updateList(args, listName) {
    const list = data[listName];
    const isArray = Array.isArray(list);
    const command = args[1]
    const item = listName === "moblist" || listName === "spamlist" ? args.slice(2).join(' ') : args.slice(2).join(' ').toLowerCase();

    // Object pairs
    const held = Player?.getHeldItem()?.getItemNBT()?.getCompoundTag("tag")?.getCompoundTag("ExtraAttributes")?.getString("id");
    const value = listName === "cdlist" || listName === "valuelist" ? unformatNumber(args[3] ?? args[2]) : args.slice(3).join(' ');
    const key = listName === "colorlist" ? convertToPascalCase(args[2]) :
        (listName === "cdlist" || listName === "valuelist") && held !== undefined ? held : args[2];

    switch (command) {
        case "add": // ADD TO LIST
            if (isArray && !list.includes(item)) {
                list.push(item);
                ChatLib.chat(`${LOGO + GREEN}Successfully added "${WHITE + item + GREEN}" to the ${listName}!`);
            } else if (!isArray && !(key in list)) {
                list[key] = value;
                ChatLib.chat(`${LOGO + GREEN}Successfully linked "${WHITE + value + GREEN}" to [${WHITE + key + GREEN}]!`);
            } else ChatLib.chat(`${LOGO + RED}[${WHITE + (isArray ? item : key + RED)}] is already in the ${listName}!`);
            break;
        case "remove": // REMOVE FROM LIST
            if (isArray && list.indexOf(item) > -1) {
                list.splice(list.indexOf(item), 1);
                ChatLib.chat(`${LOGO + GREEN}Successfully removed "${WHITE + item + GREEN}" from the ${listName}!`);
            } else if (!isArray && key in list) {
                delete list[key];
                ChatLib.chat(`${LOGO + GREEN}Successfully removed "${WHITE + key + GREEN}" from the ${listName}!`);
            } else ChatLib.chat(`${LOGO + RED}[${WHITE + item + RED}] is not in the ${listName}!`);
            break;
        case "clear": // CLEAR LIST
            if (isArray) list.length = 0;
            else Object.keys(list).forEach(key => delete list[key]);
            ChatLib.chat(`${LOGO + GREEN}Successfully cleared the ${listName}!`);
            return;
        case "view": // DISPLAY LIST
        case "list":
            ChatLib.clearChat(lines);
            lines = [5858, 5859];
            let id = 5860;
            const page = parseInt(args[2] ?? 1);
            const length = isArray ? list.length : Object.keys(list).length;
            const total = Math.ceil(length / 12) || 1;

            // Print out header
            new Message("\n&c&m-----------------------------------------------------").setChatLineId(5858).chat();
            const lArrow = new TextComponent("&r&e&l<<&r&9")
                .setClickAction("run_command")
                .setClickValue(`/va ${listName} list ${page - 1}`)
                .setHoverValue(`${YELLOW}Click to view page ${page - 1}.`);
            const rArrow = new TextComponent("&r&e&l>>")
                .setClickAction("run_command")
                .setClickValue(`/va ${listName} list ${page + 1}`)
                .setHoverValue(`${YELLOW}Click to view page ${page + 1}.`);
            const header = new Message("&r&9                     ").setChatLineId(5859);

            header.addTextComponent(page > 1 ? lArrow : "   ");
            header.addTextComponent(` §6${convertToTitleCase(listName)} §8(§fPage §7${page} §fof §7${total}§8) `);
            if (page < total) header.addTextComponent(rArrow);
            header.addTextComponent("\n").chat();

            // Loop through variables
            const pageIndex = (page - 1) * 12;
            if (isArray) {
                for (let i = pageIndex; i < Math.min(pageIndex + 12, length); i++) {
                    new Message(` ${DARK_GRAY}⁍ `, new TextComponent(`${AQUA + list[i]}`)
                        .setClickAction("run_command")
                        .setClickValue(`/va ${listName} remove ${list[i]}`)
                        .setHoverValue(`${YELLOW}Click to remove ${AQUA + list[i] + YELLOW} from list.`)
                    ).setChatLineId(++id).chat();
                    lines.push(id);
                }
            } else {
                const keys = Object.keys(list);
                for (let i = pageIndex; i < Math.min(pageIndex + 12, length); i++) {
                    let key = keys[i];
                    new Message(` ${DARK_GRAY}⁍ `, new TextComponent(`${AQUA + key}`)
                        .setClickAction("run_command")
                        .setClickValue(`/va ${listName} remove ${key}`)
                        .setHoverValue(`${YELLOW}Click to remove ${AQUA + key + YELLOW} from list.`),
                        `${GRAY} => ${YELLOW + list[key]}`
                    ).setChatLineId(++id).chat();
                    lines.push(id);
                }
            }

            // Footer
            new Message("&c&m-----------------------------------------------------&r").setChatLineId(++id).chat();
            lines.push(id);
            return;
        case "reset": // RESET LIST TO DEFAULT
            if (listName === "dianalist") data.dianalist = ["hub", "da", "castle", "museum", "wizard"];
            else if (listName === "attributelist") data.attributelist = ["arachno", "attack_speed", "blazing", "combo", "elite", "ender", "ignition", "life_recovery", 
                "mana_steal", "midas_touch", "undead", "warrior", "deadeye", "arachno_resistance", "blazing_resistance", "breeze", "dominance", "ender_resistance", 
                "experience", "fortitude", "life_regeneration", "lifeline", "magic_find", "mana_pool", "mana_regeneration", "mending", "speed", "undead_resistance", "veteran",
                "blazing_fortune", "fishing_experience", "infection", "double_hook", "fisherman", "fishing_speed", "hunter", "trophy_hunter"];
            else if (listName === "moblist") if (listName === "moblist") data.moblist = ["vanquisher", "jawbus", "thunder", "inquisitor"];
            else if (isArray) list.length = 0;
            else Object.keys(list).forEach(key => delete list[key]);
            ChatLib.chat(`${LOGO + GREEN}Successfully reset the ${listName}!`);
            return;
        case "value":
            if (listName === "attributelist") {
                data.attributelist = ["breeze", "dominance", "fortitude", "lifeline", "magic_find", "mana_pool", "mana_regeneration", "mending", "speed", "veteran",
                    "blazing_fortune", "fishing_experience"];
                ChatLib.chat(`${LOGO + GREEN}Successfully limited to valuable attributes!`);
                break;
            }
        default:
            ChatLib.chat(`\n${LOGO + RED}Error: Invalid argument "${command}"!`);
            let base = `${LOGO + RED}Please input as: ${WHITE}/va ${listName} ${GRAY}<${WHITE}view, clear, add, remove`;

            if (listName === "cdlist") base += `[cd]
${DARK_GRAY}This will set the cooldown of your currently held item.

${DARK_AQUA}Special args (put in front, e.x 'a60'):
- ${AQUA}none ${GRAY}=> ${GRAY}right click
- ${AQUA}l ${GRAY}=> ${AQUA}left click
- ${AQUA}a ${GRAY}=> ${AQUA}no cd (e.x Plasmaflux)
- ${AQUA}s ${GRAY}=> ${AQUA}shift`;
            else if (listName === "emotelist") base += `${GRAY}> ${WHITE}[key] [value]`;
            else if (listName === "dianalist") base += `${GRAY}> <${WHITE}hub, castle, da, museum, crypt, wizard${GRAY}>>`;
            else if (listName === "moblist") base += `${GRAY}> <${WHITE}[MCEntityClass], [Stand Name]${GRAY}>>`;
            else if (listName === "colorlist") base += `${GRAY}> ${WHITE}[mob] [r] [g] [b]`;
            else if (listName === "valuelist") base += `${GRAY}> ${WHITE}*[item_id] [value]\n${DARK_GRAY}This will set the value of your currently held item.`;
            else if (listName === "spamlist")
                base += `${GRAY}> ${WHITE}[phrase]\n${DARK_GRAY}Remember to add variables with ${"${var}"}, for example:\n ${DARK_GRAY}va sl add Guild > ${"${player}"} left.`;
            else if (listName === "attributelist") base += `, value> ${WHITE}[attribute_name]`
            else base += "[item]";
            
            ChatLib.chat(base);
            return;
    }
    
    if (listName === "moblist" || listName === "colorlist") updateEntityList();
    else if (listName === "dianalist") setWarps();
    else if (listName === "valuelist") updateAuction();
    setRegisters(off = settings.skyblockToggle && !Scoreboard.getTitle().removeFormatting().includes("SKYBLOCK"));
    ChatLib.command(`va ${listName} list`, true);
}


// --- ETC ---
/**
 * Returns the current paused state.
 *
 * @returns {boolean} - The current paused state.
 */
let paused = false;
export function getPaused() {
    return paused;
}

// Key binding for pausing or unpausing trackers
const pauseKey = new KeyBind("Pause Trackers", data.pauseKey, "./VolcAddons.xdd");
pauseKey.registerKeyPress(() => {
    paused = !paused;
    const message = paused ? `${RED}Paused` : `${GREEN}Resumed`;
    ChatLib.chat(`${LOGO + GOLD}Tracker ${message}!`);
});
register("gameUnload", () => {
    data.pauseKey = pauseKey.getKeyCode();
});

// Stats tracking class
export class Stat {
    constructor() {
        this.reset();
    }

    reset() {
        this.start = 0.00; // Starting amount
        this.now = 0.00; // Current amount
        this.time = 1; // Time passed
        this.since = 600; // Time since last amount earn
        this.level = 0; // Skill level
    }

    getGain() {
        return this.now - this.start;
    }

    getRate() {
        return this.getGain() / this.time * 3600;
    }
}

// Saving data to persistent storage upon game unload
register("gameUnload", () => {
    data.save();
}).setPriority(Priority.LOWEST);
