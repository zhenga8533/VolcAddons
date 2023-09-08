import PogObject from "../../PogData";
import { AQUA, BOLD, CAT_SOULS, ENIGMA_SOULS, GOLD, GREEN, LOGO, RED, RESET, WHITE } from "./constants";
import { delay } from "./thread";


// --- PERSISTENT DATA ---
export let data = new PogObject("VolcAddons", {
    // Properties with default values for various settings and data
    "newUser": true,
    "version": "2.3.1",
    "profileId": undefined,
    "world": "none",
    "tier": 0,
    "lastMsg": "joe",
    "whitelist": [],
    "blacklist": [],
    // An array of default warp locations
    "warplist": ["hub", "da", "castle", "museum", "wizard"],
    "moblist": [],
    "emotelist": {},
    "cooldownlist": {},
    "files": [],
    // Properties related to timing and split data
    "splits": {
        "last": [0, 0, 0, 0, 0],
        "best": [999, 999, 999, 999, 9999],
        "worst": [0, 0, 0, 0, 0],
    },
    // Properties related to tracker session data
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
    // Properties representing upgrades for the composter
    "composterUpgrades": {
        "Composter Speed": -1,
        "Multi Drop": -1,
        "Cost Reduction": -1
    },
    // Various location properties used for displaying HUD elements
    "apexPrice": 2e9,
    "dianaKey": 0,
    "pauseKey": 0,
    "devKey": 0,
    "QL": [15, 200, 1], // Vanquisher Location
    "GL": [15, 200, 1], // Gyro Location
    "SL": [15, 250, 1], // Splits Location
    "CL": [15, 250, 1], // Counter Location
    "VL": [15, 250, 1], // Visitors Location
    "NL": [15, 350, 1], // Next Visitors Location
    "TL": [15, 300, 1], // Golden Fish Timer Location
    "AL": [15, 300, 1], // Skill Tracker Location
    "BL": [15, 400, 1], // Vampire Location
    "UL": [15, 450, 1], // Tuba Location
    "ML": [15, 450, 1], // Coins Location
    "PL": [15, 500, 1], // Powder Location
    "IL": [15, 500, 1], // Inq Location
    "KL": [100, 350, 1], // Kuudra Profit Location
    "ZL": [100, 450, 1], // Kuudra Profit Tracker Location
    "LL": [50, 350, 1], // Server Status Location
    "RL": [250, 300, 1], // Container Value Location
    "EL": [300, 200, 1], // Advanced Value Location
    "WL": [30, 200, 1], // Wolf Combo Location
    "HL": [30, 200, 1], // Powder Chest Location
    "DL": [30, 200, 1], // Broodmother Location
    // Rift waypoint properties
    "enigmaSouls": ENIGMA_SOULS,
    "catSouls": CAT_SOULS
}, "datitee.json");


// --- TRIGGER CONTROL ---

// An array to store registered triggers and their dependencies
let registers = [];

/**
 * Adds a trigger with its associated dependency to the list of registered triggers.
 *
 * @param {Trigger} trigger - The trigger to be added.
 * @param {function} dependency - The function representing the dependency of the trigger.
 */
export function registerWhen(trigger, dependency) {
    registers.push([trigger.unregister(), dependency, false]);
}

// Updates trigger registrations based on world or GUI changes
export function setRegisters(off = false) {
    registers.forEach(trigger => {
        if (off === true || (!trigger[1]() && trigger[2]) || !Scoreboard?.getTitle()?.includes("SKYBLOCK")) {
            trigger[0].unregister();
            trigger[2] = false;
        } else if (trigger[1]() && !trigger[2]) {
            trigger[0].register();
            trigger[2] = true;
        }
    });
}
delay(() => setRegisters(), 1000);

// Event handler for GUI settings close.
register("guiClosed", (event) => {
    if (event.toString().includes("vigilance")) setRegisters();
});


// --- LIST CONTROL ---
import { updateEntityList } from "../features/combat/EntityDetect";

/**
 * Updates a list based on the provided arguments.
 *
 * @param {string[]} args - An array of arguments provided for the list update.
 * @param {Array|string} list - The list to be updated.
 * @param {string} listName - The name of the list for displaying messages.
 * @returns {Array|string} - The updated list.
 */
export function updateList(args, list, listName) {
    const isArray = Array.isArray(list);
    const command = args[1]
    const item = listName === "moblist" ? args.slice(2).join(' ') : args.slice(2).join(' ').toLowerCase();
    const value = listName === "cdlist" ? args[2] : args.slice(3).join(' ');
    const key = listName === "cdlist" ? Player.getHeldItem().getName() : args[2];

    switch (command) {
        case ("add"): // ADD TO LIST
            if (isArray && !list.includes(item)) {
                list.push(item);
                ChatLib.chat(`${LOGO} ${GREEN}Successfully added [${WHITE}${item}${GREEN}] to the ${listName}!`);
            } else if (!isArray && !(key in list)) {
                list[key] = value;
                ChatLib.chat(`${LOGO} ${GREEN}Successfully linked [${WHITE}${value}${GREEN}] to [${WHITE}${key}${GREEN}]!`);
            } else ChatLib.chat(`${LOGO} ${RED}[${WHITE}${isArray ? item : key}${RED}] is already in the ${listName}!`);
            break;
        case ("remove"): // REMOVE FROM LIST
            if (isArray && list.indexOf(item) > -1) {
                list.splice(list.indexOf(item), 1);
                ChatLib.chat(`${LOGO} ${GREEN}Successfully removed [${WHITE}${item}${GREEN}] from the ${listName}!`);
            } else if (!isArray && key in list) {
                delete list[key];
                ChatLib.chat(`${LOGO} ${GREEN}Successfully removed [${WHITE}${key}${GREEN}] from the ${listName}!`);
            } else ChatLib.chat(`${LOGO} ${RED}[${WHITE}${item}${RED}] is not in the ${listName}!`);
            break;
        case ("clear"): // CLEAR LIST
        case ("reset"):
            if (isArray) list.length = 0;
            else Object.keys(list).forEach(key => delete list[key]);
            ChatLib.chat(`${LOGO} ${GREEN}Successfully cleared the ${listName}!`);
            break;
        case ("view"): // DISPLAY LIST
        case ("list"):
            if (isArray) {
                ChatLib.chat(`${GOLD}${BOLD}${list.length} Items in ${listName}:${RESET}`);
                list.forEach(user => { ChatLib.chat(` ⁍ ${user}`) });
            } else {
                ChatLib.chat(`${GOLD}${BOLD}${Object.keys(list).length} Items in ${listName}:${RESET}`);
                Object.keys(list).forEach((key) => { ChatLib.chat(` ⁍ ${key} => ${list[key]}`) });
            }
            break;
        default:
            ChatLib.chat(`${LOGO} ${AQUA}Please enter as /va ${listName} <view, clear, <add, remove> [item]>`);
            break;
    }
    
    if (args[0] === "ml" || args[0] === "mob" || args[0] === "moblist") updateEntityList();
    setRegisters();
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
const pauseKey = new KeyBind("Pause Trackers", data.pauseKey, "VolcAddons");
pauseKey.registerKeyPress(() => {
    paused = !paused;
    const message = paused ? `${RED}Paused` : `${GREEN}Resumed`;
    ChatLib.chat(`${LOGO} ${GOLD}Tracker ${message}!`);
});
register("gameUnload", () => {
    data.pauseKey = pauseKey.getKeyCode();
});

// Stats tracking class
export class Stat {
    constructor() {
        // Initializing properties for tracking statistics
        this.reset();
    }

    // Method to reset stat properties
    reset() {
        this.start = 0.00; // Starting Amount
        this.now = 0.00; // Current Amount
        this.gain = 0.00; // Current - Starting Amount
        this.next = 0.00; // Next Level
        this.time = 0.00; // Time passed
        this.rate = 0.00; // Amount/hr
        this.since = 600; // Time since last Amount earn
    }
}

// Saving data to persistent storage upon game unload
register("gameUnload", () => {
    data.save();
}).setPriority(Priority.LOWEST);
