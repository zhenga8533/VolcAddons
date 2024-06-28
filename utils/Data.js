import PogObject from "../../PogData";
import { BUTTON_PRESETS } from "./Constants";

// Relocate old data files (<2.9.5)
if (FileLib.exists("./config/ChatTriggers/modules/VolcAddons/datitee.json")) {
  const fileData = FileLib.read("VolcAddons", "datitee.json");
  FileLib.write("VolcAddons", "data/datitee.json", fileData);
  FileLib.delete("VolcAddons", "datitee.json");
}

const DEFAULT_GUI = {
  AL: [780, 430, 1.2, false, false, true], // Skill Tracker Location
  BL: [10, 120, 1.2, false, false, true], // Vampire Location
  CL: [10, 180, 1.2, false, false, true], // Counter Location
  DL: [575, 165, 1.2, false, false, true], // Dungeon Profit Location
  EL: [100, 150, 1.1, false, false, true], // Advanced Value Location
  FL: [220, 10, 1.2, false, false, true], // Trophy Fish Location
  GL: [10, 140, 1.2, false, false, true], // Gyro Location
  HL: [10, 240, 1.2, false, false, true], // Powder Chest Location
  IL: [10, 180, 1.2, false, false, true], // Inq Location
  JL: [150, 180, 1.2, false, false, true], // Kill Counter Location
  KL: [575, 165, 1.2, false, false, true], // Kuudra Profit Location
  LL: [770, 70, 1.2, false, false, true], // Server Status Location
  ML: [780, 390, 1.2, false, false, true], // Coins Location
  OL: [10, 130, 1.2, false, false, true], // Composter Location
  PL: [10, 85, 1.2, false, false, true], // Powder Location
  QL: [250, 225, 4, false, false, true], // Vanquisher Location
  RL: [600, 175, 1, false, false, true], // Container Value Location
  SL: [10, 180, 1.2, false, false, true], // Splits Location
  TL: [10, 130, 1.2, false, false, true], // Golden Fish Timer Location
  UL: [930, 65, 1.2, false, false, false], // Armor Display Location
  VL: [10, 170, 1.2, false, false, true], // Visitors Location
  WL: [730, 130, 1.2, false, false, true], // Wolf Combo Location
  XL: [Renderer.screen.getWidth() / 2 - 96, (Renderer.screen.getHeight() * 6) / 7, 1, false, false, true], // Searchbox location
  YL: [770, 165, 1.2, false, false, true], // SkyBlock Stats Location
  ZL: [780, 330, 1.2, false, false, true], // Kuudra Profit Tracker Location
  BCL: [180, 10, 1, false, false, true], // Bingo Card Location
  BEL: [180, 10, 1.2, false, false, true], // Bestiary Counter Location
  CDL: [185, 65, 1.2, false, false, true], // Commission Display Location
  CEL: [375, 275, 3, false, false, true], // Crate edit location
  CFL: [625, 120, 1.2, false, false, true], // Chocolate factory location
  CGL: [625, 70, 1.2, false, false, true], // Chocolate egg location
  CPL: [575, 160, 1, false, false, false], // Container preview location
  EQL: [905, 65, 1.2, false, false, false], // Equipment Location
  FHL: [580, 160, 1.2, false, false, true], // Fossil Helper Location
  PDL: [580, 460, 1.2, false, false, true], // Pick display location
  PHL: [170, 160, 1.2, false, false, true], // Pesthunter Location
  SDL: [170, 180, 1.2, false, false, true], // Spray Display Location
  SPL: [392, 26, 1, false, false, true], // Storage Preview Location
  TVL: [600, 150, 1.2, false, false, true], // Trade Value Location
};

// --- PERSISTENT DATA ---
export let data = new PogObject(
  "VolcAddons",
  {
    // VolcAddons data tracking
    newUser: true,
    version: "2.3.1",
    vision: false,
    devMode: false,
    // Container bindings
    wardBinds: {},
    slotBinds: {
      36: [],
      37: [],
      38: [],
      39: [],
      40: [],
      41: [],
      42: [],
      43: [],
      44: [],
    },
    bindPresets: {},
    buttons: {},
    buttonPresets: BUTTON_PRESETS,
    // Control keys
    dianaKey: 0,
    pauseKey: 0,
    devKey: 0,
    recipeKey: 0,
    bindKey: 0,
    chunkey: 0,
    wardKey: 0,
    // Hypixel persistant data
    commands: {},
    equipmentLore: [[], [], [], []],
    party: {
      in: false,
      leader: false,
      members: [],
      updated: 0,
    },
    pet: undefined,
    wordbanks: [],
    // playtime tracking
    playtime: 0,
    lastDay: 0,
    lastJoin: Date.now(),
    // lists
    whitelist: [],
    blacklist: [],
    dianalist: ["hub", "da", "castle", "museum", "wizard"],
    moblist: [],
    colorlist: {},
    emotelist: {},
    cdlist: {},
    valuelist: {},
    spamlist: [],
    ignorelist: [],
    prefixlist: ["?"],
    attributelist: [
      "breeze",
      "dominance",
      "fortitude",
      "lifeline",
      "magic_find",
      "mana_pool",
      "mana_regeneration",
      "mending",
      "speed",
      "veteran",
      "blazing_fortune",
      "fishing_experience",
    ],
    widgetlist: [],
    WGL: {},
    // chocolate factory data
    cf: {
      chocolate: 0,
      production: 0,
      last: 0,
      total: 0,
      all: 0,
      prestige: 0,
      multiplier: 0,
    },
    eggs: {
      dupe: 0,
      total: 0,
      max: 20,
      found: {},
    },
    timeTower: {
      charges: 0,
      chargeTime: 0,
      activeTime: 0,
      bonus: 0,
    },
    // Kuudra data
    files: [],
    splits: {
      last: [0, 0, 0, 0, 0],
      best: [999, 999, 999, 999, 9999],
      worst: [0, 0, 0, 0, 0],
    },
    kuudraSession: {
      profit: 0,
      chests: 0,
      average: 0,
      time: 0,
      rate: 0,
    },
    // Mob tracker data
    vanqSession: {
      vanqs: 0,
      kills: 0,
      last: 0,
      average: 0,
    },
    inqSession: {
      inqs: 0,
      burrows: 0,
      last: 0,
      average: 0,
    },
    // Economy calculator data
    composterUpgrades: {
      "Composter Speed": -1,
      "Multi Drop": -1,
      "Cost Reduction": -1,
    },
    // GUI locations
    ...DEFAULT_GUI,
  },
  "data/datitee.json"
);
if (data.eggs.dupe === 0) data.eggs.dupe = data.dupeEggs ?? 0;

export const itemNBTs = new PogObject(
  "VolcAddons",
  {
    armor: [null, null, null, null],
    equip: [null, null, null, null],
    backpacks: [],
    enderchests: [],
    storageCache: {},
  },
  "data/itemNBTs.json"
);

// Set up storage data
if (itemNBTs.backpacks.length === 0) {
  for (let i = 0; i < 18; i++) itemNBTs.backpacks.push(new Array(54).fill(null));
}
if (itemNBTs.enderchests.length === 0) {
  for (let i = 0; i < 18; i++) itemNBTs.enderchests.push(new Array(54).fill(null));
}
data.autosave(30);

// --- GUI CONTROL ---
export function resetGUI() {
  Object.keys(DEFAULT_GUI).forEach((overlay) => {
    data[overlay] = DEFAULT_GUI[overlay];
  });
}

// Saving data to persistent storage upon game unload
register("gameUnload", () => {
  data.lastJoin = Date.now();
  data.save();
  itemNBTs.save();
}).setPriority(Priority.LOWEST);
