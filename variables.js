import PogObject from "../PogData"
import { AQUA, BOLD, GOLD, GRAY, GREEN, RED, RESET, WHITE } from "./constants";

// --- PERSISTANT DATA ---
export let data = new PogObject("VolcAddons", {
    "newUser": true,
    "version": "2.3.1",
    "whitelist": [],
    "blocklist": [],
    "warplist": ["hub", "da", "castle", "museum"],
    "moblist": [],
    "files": [],
    "splits": {
        "last": [0, 0, 0, 0, 0],
        "best": [999, 999, 999, 999, 9999]
    },
    "vanqSession": {
        "vanqs": 0,
        "kills": 0,
        "last": 0,
        "average": 0,
    },
    "dianaKey": 33,
    "apexPrice": 1e9,
    "GL": [15, 200], // Gyro Location
    "SL": [15, 250], // Splits Location
    "CL": [15, 250], // Counter Location
    "VL": [15, 250], // Visitors Location
    "TL": [15, 300], // Golden Fish Timer Location
}, "datitee.json");

// --- LIST CONTROL ---
export function updateList(args, list, listName) {
    const username = args[2] == undefined ? undefined : args[2].toLowerCase();
    switch (args[1]) {
        case ("add"): // ADD TO LIST
            if (!list.includes(username)) {
                list.push(username);
                ChatLib.chat(`${GREEN}Successfully added [${username}] to the ${listName}!`);
            } else ChatLib.chat(`${RED}Player [${username}] is already in the ${listName}!`);
            break;
        case ("remove"): // REMOVE FROM LIST
            const index = list.indexOf(username);

            if (index > -1) {
                list.splice(index, 1);
                ChatLib.chat(`${GREEN}Successfully removed [${username}] from the ${listName}!`);
            } else ChatLib.chat(`${RED}Player [${username}] is not in the ${listName}!`);
            break;
        case ("clear"): // CLEAR LIST
            list = list.splice(0, list.length);
            ChatLib.chat(`${GREEN}Successfully cleared cleared the ${listName}!`);
            break;
        case ("view"): // DISPLAY LIST
        case ("list"):
            ChatLib.chat(`${GOLD}${BOLD}${list.length} Users in ${listName}:${RESET}`);
            list.forEach(user => { ChatLib.chat(` ⁍ ${user}`) });
            break;
        default:
            ChatLib.chat(`${AQUA}Please enter as /va ${listName} <add, remove> <ign> | view | clear!`);
            break;
    }
    return list;
}

// --- VARIABLES ---
let inParty = false;
export function getInParty() { return inParty; }

let isLeader = false;
export function getIsLeader() { return isLeader; }

let partyMembers = [];

let lastParty = [];

let world = "none";
export function getWorld() { return world; }

// Function to remove rank from player name
export function getPlayerName(player) {
    let name = player;
    let nameIndex = name.indexOf(']');

    while (nameIndex != -1) {
        name = name.substring(nameIndex + 2);
        nameIndex = name.indexOf(']');
    }

    return name;
}

// --- TRACK PARTY ---
register("chat", () => { // Tracks /stream open x
    inParty = true;
    isLeader = true;
}).setCriteria("Party is capped at ${cap} players.")

register("chat", (player) => { // Tracks /p disband
    inParty = false;
    isLeader = false;
    lastParty = [...partyMembers];
    partyMembers = [];
}).setCriteria("${player} has disbanded the party!")

register("chat", () => { // Tracks empty party
    inParty = false;
    isLeader = false;
    lastParty = [...partyMembers];
    partyMembers = [];
}).setCriteria("The party was disbanded because all invites expired and the party was empty.")

register("chat", () => { // Tracks /p leave
    inParty = false;
    isLeader = false;
    lastParty = [...partyMembers];
    partyMembers = [];
}).setCriteria("You left the party.")

// --- TRACK PARTY LEADER ---
register("chat", (player1, player2) => { // Tracks transfers
    if (Player.getName().equals(getPlayerName(player1))) isLeader = true;
    else isLeader = false;
}).setCriteria("The party was transferred to ${player1} by ${player2}")

register("chat", (player1, player2) => { // Tracks transfers by leave
    if (Player.getName().equals(getPlayerName(player1))) isLeader = true;
    else isLeader = false;
}).setCriteria("The party was transferred to ${player1} because ${player2} left")

register("chat", (player1, player2) => { // Tracks transfers by promotion
    if (Player.getName().equals(getPlayerName(player2))) isLeader = true;
    else isLeader = false;
}).setCriteria("${player1} has promoted ${player2} to Party Leader")

register("chat", (player1, player2) => { // Tracks first invite
    if (Player.getName().equals(getPlayerName(player1)) && !inParty) isLeader = true;
    inParty = true;
}).setCriteria("${player1} invited ${player2} to the party! They have 60 seconds to accept.")

// --- TRACK PARTY MEMBERS ---
register("chat", (player) => { // Tracks first join
    isLeader = false;
    inParty = true;
    partyMembers.push(getPlayerName(player));
}).setCriteria("You have joined ${player}'s party!");

register("chat", (names) => {
    names.split(", ").forEach(name => { partyMembers.push(getPlayerName(name)) });
}).setCriteria("You'll be partying with: ${names}");

register("chat", (player) => { // Tracks player join
    if (!partyMembers.includes(getPlayerName(player))) partyMembers.push(getPlayerName(player));
}).setCriteria("${player} joined the party.");

register("chat", (player) => { // Tracks player leave
    const index = partyMembers.indexOf(getPlayerName(player));
    if (index > -1) partyMembers.splice(index, 1);
    lastLeave = getPlayerName(player);
}).setCriteria("${player} has left the party.");

register("chat", (player) => { // Tracks player kick
    const index = partyMembers.indexOf(getPlayerName(player));
    if (index > -1) partyMembers.splice(index, 1);
    lastLeave = getPlayerName(player);
}).setCriteria("${player} has been removed from the party.");

register("chat", () => { // Tracks player kick
    inParty = false;
    lastParty = [...partyMembers];
    partyMembers = [];
}).setCriteria("You have been kicked from the party by ${player}");

// ---  CONTROL FOR GAME/CT RS ---
register("gameLoad", () => {
    ChatLib.chat(`${GOLD}VolcAddons ${GRAY}> ${WHITE}Checking for party!`);
    setTimeout(() => { ChatLib.command("p list"); }, 500);
});
register("chat", () => {
    ChatLib.chat(`${GOLD}VolcAddons ${GRAY}> ${WHITE}Checking for party!`);
    setTimeout(() => { ChatLib.command("p list"); }, 500);
}).setCriteria("Welcome to Hypixel SkyBlock!");

register("chat", (leader) => {
    ign = getPlayerName(leader);
    if (Player.getName().equals(ign)) isLeader = true;
    else {
        if (!partyMembers.includes(ign)) partyMembers.push(ign);
        isLeader = false;
    }
    inParty = true;
}).setCriteria("Party Leader: ${leader} ●");

register("chat", (members) => {
    members.split(" ● ").forEach(member => {
        ign = getPlayerName(member);
        if (!partyMembers.includes(ign) && !Player.getName().equals(ign)) partyMembers.push(ign);
    });
}).setCriteria("Party Moderators: ${members} ● ");

register("chat", (members) => {
    members.split(" ● ").forEach(member => {
        ign = getPlayerName(member);
        if (!partyMembers.includes(ign) && !Player.getName().equals(ign)) partyMembers.push(ign);
    });
}).setCriteria("Party Members: ${members} ● ");

// --- GETS WORLD NAME ---
let scoreboard = Scoreboard.getLines();

const LOCATIONS = {
    "hub": [
        "AuctionHouse", "Bank", "BazaarAlley", "Blacksmith", "BuildersHouse", "CanvasRoom", "CatacombsEntrance", "Colosseum", "ColosseumArena",
        "CommunityCenter", "CoalMine", "ElectionRoom", "Farm", "Farmhouse", "FashionShop", "FishermansHut", "FlowerHouse","Forest", "Graveyard",
        "Hexatorum", "HighLevel", "Library", "Mountain", "Ruins", "Tavern", "Thaumaturgist", "Village", "Wilderness", "WizardTower"],
    "garden": [
        "TheGarden", "Plot1", "Plot2", "Plot3", "Plot4", "Plot5", "Plot6", "Plot7", "Plot8", "Plot9", "Plot10", "Plot11", "Plot12", "Plot13", 
        "Plot14", "Plot15", "Plot16", "Plot17", "Plot18", "Plot19", "Plot20", "Plot21", "Plot22", "Plot23", "Plot24", "GardenPlot"],
    "crimson isle": [
        "Stronghold", "CrimsonIsle", "CrimsonFields", "BlazingVolcano", "OdgersHut", "PlhlegblastPool", "MagmaChamber", "AurasLab", "MatriarchsLair",
        "BellyoftheBeast", "Dojo", "BurningDesert", "MysticMarsh", "BarbarianOutpost", "MageOutpost", "Dragontail", "ChiefsHut",
        "DragontailBlacksmith", "DragontailTownsquare", "DragontailAuctionHous", "DragontailBazaar", "DragontailBank", "MinionShop", "TheDukedom",
        "TheBastion", "Scarleton", "CommunityCenter", "ThroneRoom", "MageCouncil", "ScarletonPlaza", "ScarletonMinionShop",
        "ScarletonAuctionHouse", "ScarletonBazaar", "ScarletonBank", "ScarletonBlacksmith", "IgrupansHouse", "IgrupansChickenCoop", "Cathedral",
        "Courtyard", "TheWasteland", "RuinsofAshfang", "ForgottenSkull", "SmolderingTomb"],
    "kuudra t5": [
        "KuudrasHollowT5"],
    "kuudra f4": [
        "KuudrasHollowT1", "KuudrasHollowT2", "KuudrasHollowT3", "KuudrasHollowT4"]
}

let noFind = 0;
function findWorld() {
    const title = Scoreboard.getTitle();
    // In case not in SB (no infinite loop)
    if (title.length == 0 || !title.removeFormatting().includes("SKYBLOCK")) noFind++;
    if (noFind == 100) return;

    // Get scoreboard line with world name
    scoreboard = Scoreboard.getLines();
    worldLine = scoreboard.find((line) => line.getName().includes("⏣"));
    worldLine = worldLine == undefined ? "None" : worldLine.getName().removeFormatting().replace(/\W/g, '');

    setTimeout(() => {
        if (worldLine.includes("None"))
            findWorld();
        else {
            for (let location in LOCATIONS)
                if (LOCATIONS[location].includes(worldLine)) {
                    world = location;
                    break;
                }
        }
    }, 100);
}

register("worldLoad", () => {
    world = "none";
    noFind = 0;
    findWorld();
});

// Backup Data
register("gameUnload", () => {
    data.save();
});