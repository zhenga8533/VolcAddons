// Importing constants and utility functions from other files
import { AQUA, BOLD, CAT_SOULS, ENIGMA_SOULS, GOLD, GREEN, LOGO, RED, RESET, WHITE } from "./constants";
import { delay } from "./thread";

// Importing the PogObject class from another file named "PogData"
import PogObject from "../../PogData";


// --- PERSISTENT DATA ---

// Initializing a persistent data object using the PogObject class
export let data = new PogObject("VolcAddons", {
    // Properties with default values for various settings and data
    "newUser": true,
    "version": "2.3.1",
    "profileId": undefined,
    "world": "none",
    "tier": 0,
    "whitelist": [],
    "blacklist": [],
    "blocklist": [],
    // An array of default warp locations
    "warplist": ["hub", "da", "castle", "museum"],
    "moblist": [],
    "emotelist": {},
    "files": [],
    // Properties related to timing and split data
    "splits": {
        "last": [0, 0, 0, 0, 0],
        "best": [999, 999, 999, 999, 9999],
        "worst": [0, 0, 0, 0, 0],
    },
    // Properties related to vanquisher session data
    "vanqSession": {
        "vanqs": 0,
        "kills": 0,
        "last": 0,
        "average": 0,
    },
    // Properties related to inquisitor session data
    "inqSession": {
        "inqs": 0,
        "burrows": 0,
        "last": 0,
        "average": 0,
    },
    // Properties representing upgrades for the composter
    "composterUpgrades": {
        "Composter Speed": -1,
        "Multi Drop": -1,
        "Cost Reduction": -1
    },
    // Various location properties used for displaying HUD elements
    "dianaKey": 33,
    "pauseKey": 25,
    "apexPrice": 2e9,
    "QL": [15, 200, 1], // Vanquisher Location
    "GL": [15, 200, 1], // Gyro Location
    // ... (Other location properties)
    // Properties related to enigma and cat souls
    "enigmaSouls": ENIGMA_SOULS,
    "catSouls": CAT_SOULS
}, "datitee.json");


// --- LIST CONTROL ---

/**
 * Updates a list based on the provided arguments.
 *
 * @param {string[]} args - An array of arguments provided for the list update.
 * @param {Array|string} list - The list to be updated.
 * @param {string} listName - The name of the list for displaying messages.
 * @returns {Array|string} - The updated list.
 */
export function updateList(args, list, listName) {
    // Extracting the item and determining if the list is an array
    const item = args[2] == undefined ? undefined : args[2].toLowerCase();
    const isArray = Array.isArray(list);

    // Switch statement to handle different list update commands
    switch (args[1]) {
        case ("add"): // ADD TO LIST
            if (isArray && !list.includes(item)) {
                // Adding item to the array list
                list.push(item);
                ChatLib.chat(`${LOGO} ${GREEN}Successfully added [${WHITE}${args[2]}${GREEN}] to the ${listName}!`);
            } else if (!(item in list)) {
                // Linking an item to a value in the object list
                list[item] = args[3];
                ChatLib.chat(`${LOGO} ${GREEN}Successfully linked [${WHITE}${args[2]}${GREEN}] to [${WHITE}${args[3]}${GREEN}]!`);
            } else {
                // Item already exists in the list
                ChatLib.chat(`${LOGO} ${RED}[${WHITE}${args[2]}${RED}] is already in the ${listName}!`);
            }
            break;
        case ("remove"): // REMOVE FROM LIST
            if (isArray && list.indexOf(item) > -1) {
                // Removing item from the array list
                list.splice(list.indexOf(item), 1);
                ChatLib.chat(`${LOGO} ${GREEN}Successfully removed [${WHITE}${args[2]}${GREEN}] from the ${listName}!`);
            } else if (!isArray && item in list) {
                // Removing item from the object list
                delete list[item];
                ChatLib.chat(`${LOGO} ${GREEN}Successfully removed [${WHITE}${args[2]}${GREEN}] from the ${listName}!`);
            } else {
                // Item doesn't exist in the list
                ChatLib.chat(`${LOGO} ${RED}[${WHITE}${args[2]}${RED}] is not in the ${listName}!`);
            }
            break;
        case ("clear"): // CLEAR LIST
            // Clearing the list (array or object)
            list = isArray ? [] : {};
            ChatLib.chat(`${LOGO} ${GREEN}Successfully cleared the ${listName}!`);
            break;
        case ("view"): // DISPLAY LIST
        case ("list"):
            if (isArray) {
                // Displaying array list elements
                ChatLib.chat(`${GOLD}${BOLD}${list.length} Items in ${listName}:${RESET}`);
                list.forEach(user => { ChatLib.chat(` ⁍ ${user}`) });
            } else {
                // Displaying object list elements
                ChatLib.chat(`${GOLD}${BOLD}${Object.keys(list).length} Items in ${listName}:${RESET}`);
                Object.keys(list).forEach((key) => { ChatLib.chat(` ⁍ ${key} => ${list[key]}`) });
            }
            break;
        default:
            // Invalid list update command
            ChatLib.chat(`${LOGO} ${AQUA}Please enter as /va ${listName} <view, clear, <add, remove> [item]>`);
            break;
    }
    // Returning the updated list
    return list;
}


// --- TRIGGER CONTROL ---

// An array to store registered triggers and their dependencies
let registers = [];
let openVA = false;

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
export function setRegisters() {
    registers.forEach(trigger => {
        if (trigger[1]() && !trigger[2]) {
            trigger[0].register();
            trigger[2] = true;
        } else if (!trigger[1]() && trigger[2]) {
            trigger[0].unregister();
            trigger[2] = false;
        }
    });
}

// Delaying the initial setRegisters call by 1000ms
delay(() => setRegisters(), 1000);

/**
 * Marks that the VolcAddons GUI has been opened.
 */
export function opened() {
    openVA = true;
}

// Event handler for GUI key press to update trigger registrations
register("guiKey", (char, keyCode, gui, event) => {
    if (openVA && keyCode == 1) {
        setRegisters();
        openVA = false;
    }
});

// Variable to store the pause state
let paused = false;

/**
 * Returns the current paused state.
 *
 * @returns {boolean} - The current paused state.
 */
export function getPaused() {
    return paused;
}

// Key binding for pausing or unpausing trackers
const pauseKey = new KeyBind("Pause Trackers", data.pauseKey, "VolcAddons");
pauseKey.registerKeyPress(() => {
    paused = !paused;
    ChatLib.chat(`${LOGO} ${WHITE}Tracker Pause State: ${paused}`);
});

// Saving the pauseKey key code to persistent data upon game unload
register("gameUnload", () => {
    data.pauseKey = pauseKey.getKeyCode();
});

// MVP+/++ Check
let isMVP = false;

/**
 * Returns whether the player is MVP+ or MVP++ based on chat messages.
 *
 * @returns {boolean} - Whether the player is MVP+ or MVP++.
 */
export function getMVP() {
    return isMVP;
}

// Event handler for chat messages to check MVP status
register("chat", (player) => {
    if (player == Player.getName()) {
        isMVP = true;
    }
}).setCriteria(">>> [MVP++] ${player} joined the lobby! <<<");

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
});
