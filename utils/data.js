import PogObject from "../../PogData";
import { CAT_SOULS, ENIGMA_SOULS, FAIRY_SOULS } from "./constants";


const DEFAULT_GUI = {
    "AL": [780, 430, 1.2, false, false, true], // Skill Tracker Location
    "BL": [10, 120, 1.2, false, false, true], // Vampire Location
    "CL": [10, 180, 1.2, false, false, true], // Counter Location
    "DL": [10, 180, 1.2, false, false, true], // 
    "EL": [100, 150, 1.1, false, false, true], // Advanced Value Location
    "FL": [220, 10, 1.2, false, false, true], // Trophy Fish Location
    "GL": [10, 140, 1.2, false, false, true], // Gyro Location
    "HL": [10, 240, 1.2, false, false, true], // Powder Chest Location
    "IL": [10, 180, 1.2, false, false, true], // Inq Location
    "JL": [150, 180, 1.2, false, false, true], // Kill Counter Location
    "KL": [600, 220, 1.2, false, false, true], // Kuudra Profit Location
    "LL": [770, 70, 1.2, false, false, true], // Server Status Location
    "ML": [780, 390, 1.2, false, false, true], // Coins Location
    "OL": [10, 130, 1.2, false, false, true], // Composter Location
    "PL": [10, 100, 1.2, false, false, true], // Powder Location
    "QL": [250, 225, 4, false, false, true], // Vanquisher Location
    "RL": [600, 175, 1, false, false, true], // Container Value Location
    "SL": [10, 180, 1.2, false, false, true], // Splits Location
    "TL": [10, 130, 1.2, false, false, true], // Golden Fish Timer Location
    "UL": [930, 65, 1.2, false, false, false], // Armor Display Location
    "VL": [10, 170, 1.2, false, false, true], // Visitors Location
    "WL": [730, 130, 1.2, false, false, true], // Wolf Combo Location
    "XL": [Renderer.screen.getWidth()/2 - 96, Renderer.screen.getHeight()*6/7, 1, false, false, true], // Searchbox location
    "YL": [770, 165, 1.2, false, false, true], // SkyBlock Stats Location
    "ZL": [780, 330, 1.2, false, false, true], // Kuudra Profit Tracker Location
    "BCL": [180, 10, 1, false, false, true], // Bingo Card Location
    "CDL": [190, 115, 1.2, false, false, true], // Commission Display Location
    "CEL": [375, 275, 3, false, false, true], // Crate edit location
    "CFL": [180, 130, 1.2, false, false, true], // Chocolate factory location
    "CGL": [10, 115, 1.2, false, false, true], // Chocolate egg location
    "EQL": [905, 65, 1.2, false, false, false], // Equipment Location
    "FHL": [580, 160, 1.2, false, false, true], // Fossil Helper Location
    "PHL": [170, 160, 1.2, false, false, true], // Pesthunter Location
    "SDL": [170, 180, 1.2, false, false, true], // Spray Display Location
    "TVL": [600, 150, 1.2, false, false, true], // Trade Value Location
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
    "skins": [],
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
    "prefixlist": ["?"],
    "attributelist": ["breeze", "dominance", "fortitude", "lifeline", "magic_find", "mana_pool", "mana_regeneration", "mending", "speed", "veteran", "blazing_fortune", 
        "fishing_experience"],
    "widgetlist": [],
    "WGL": {},
    // chocolate factory data
    "chocolate": 0,
    "chocoProduction": 0,
    "chocoLast": 0,
    "chocoAll": 0,
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
    "recipeKey": 0,
    "bindKey": 0,
    "chunkey": 0,
    "wardKey": 0,
    "wardBinds": {},
    "slotBinds": {},
    "bindPresets": {},
    // Wardrobe binds
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

// Saving data to persistent storage upon game unload
register("gameUnload", () => {
    data.save();
}).setPriority(Priority.LOWEST);
