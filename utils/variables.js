import { AQUA, BOLD, CAT_SOULS, ENIGMA_SOULS, GOLD, GREEN, LOGO, RED, RESET, WHITE } from "./constants";
import { delay } from "./thread";

import PogObject from "../../PogData";

// --- PERSISTANT DATA ---
export let data = new PogObject("VolcAddons", {
    "newUser": true,
    "version": "2.3.1",
    "world": "none",
    "tier": 0,
    "whitelist": [],
    "blacklist": [],
    "blocklist": [],
    "warplist": ["hub", "da", "castle", "museum"],
    "moblist": [],
    "emotelist": {},
    "files": [],
    "splits": {
        "last": [0, 0, 0, 0, 0],
        "best": [999, 999, 999, 999, 9999],
        "worst": [0, 0, 0, 0, 0],
    },
    "vanqSession": {
        "vanqs": 0,
        "kills": 0,
        "last": 0,
        "average": 0,
    },
    "composterUpgrades": {
        "Composter Speed": -1,
        "Multi Drop": -1,
        "Cost Reduction": -1
    },
    "dianaKey": 33,
    "pauseKey": 25,
    "apexPrice": 2e9,
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
    "enigmaSouls": ENIGMA_SOULS,
    "catSouls": CAT_SOULS
}, "datitee.json");

// --- LIST CONTROL ---
export function updateList(args, list, listName) {
    const item = args[2] == undefined ? undefined : args[2].toLowerCase();
    const isArray = Array.isArray(list);

    // Array lists
    switch (args[1]) {
        case ("add"): // ADD TO LIST
            if (isArray && !list.includes(item)) {
                list.push(item);
                ChatLib.chat(`${LOGO} ${GREEN}Successfully added [${WHITE}${args[2]}${GREEN}] to the ${listName}!`);
            } else if (!(item in list)) {
                list[item] = args[3];
                ChatLib.chat(`${LOGO} ${GREEN}Successfully linked [${WHITE}${args[2]}${GREEN}] to [${WHITE}${args[3]}${GREEN}]!`);
            } else ChatLib.chat(`${LOGO} ${RED}[${WHITE}${args[2]}${RED}] is already in the ${listName}!`);
            break;
        case ("remove"): // REMOVE FROM LIST
            if (isArray && list.indexOf(item) > -1) {
                list.splice(list.indexOf(item), 1);
                ChatLib.chat(`${LOGO} ${GREEN}Successfully removed [${WHITE}${args[2]}${GREEN}] from the ${listName}!`);
            } else if (!isArray && item in list) {
                delete list[item];
                ChatLib.chat(`${LOGO} ${GREEN}Successfully removed [${WHITE}${args[2]}${GREEN}] from the ${listName}!`);
            } else ChatLib.chat(`${LOGO} ${RED}[${WHITE}${args[2]}${RED}] is not in the ${listName}!`);
            break;
        case ("clear"): // CLEAR LIST
            list = isArray ? [] : {};
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
    return list;
}


// --- TRIGGER CONTROL ---
let registers = [];
let openVA = false;
export function registerWhen(trigger, dependency) {
    registers.push([trigger.unregister(), dependency, false]);
}

// Updates on world or gui change
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
delay(() => setRegisters(), 1000);

export function opened() { openVA = true; }
register("guiKey", (char, keyCode, gui, event) => {
    if (openVA && keyCode == 1) {
        setRegisters();
        openVA = false;
    }
});

let paused =  false;
export function getPaused() { return paused }

const pauseKey = new KeyBind("Pause Trackers", data.pauseKey, "VolcAddons");
pauseKey.registerKeyPress(() => {
    paused = !paused;
    ChatLib.chat(`${LOGO} ${WHITE}Tracker Pause State: ${paused}`)
});
register("gameUnload", () => { data.pauseKey = pauseKey.getKeyCode() });


// MVP+/++ Check
let isMVP = false;
export function getMVP() { return isMVP }

register("chat", (player) => {
    if (player == Player.getName())
        isMVP = true;
}).setCriteria(">>> [MVP++] ${player} joined the lobby! <<<");


// Stats tracking
export class Stat {
    constructor() {
        this.reset();
    }
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


// Backup Data
register("gameUnload", () => {
    data.save();
});
