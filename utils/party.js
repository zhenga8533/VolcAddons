// Import functions from external files
import { getPlayerName } from "./functions";
import { delay } from "./thread";


// --- VARIABLES ---

// Variable to track if the party is being detected
let detecting = false;

// The player's in-game name (initially set to "limga")
let ign = "limga";

// Variables to track party status and leadership
let inParty = false;
export function getInParty() { return inParty; }

let isLeader = false;
export function getIsLeader() { return isLeader; }


// --- TRACK PARTY ---

// Event handler for detecting when the party is opened (tracks /stream open x)
register("chat", () => {
    inParty = true;
    isLeader = true;
}).setCriteria("Party is capped at ${cap} players.");

// Event handler for detecting when the party is disbanded (/p disband)
register("chat", (player) => {
    inParty = false;
    isLeader = false;
}).setCriteria("${player} has disbanded the party!");

// Event handler for detecting an empty party (party disbands when all invites expire and it's empty)
register("chat", () => {
    inParty = false;
    isLeader = false;
}).setCriteria("The party was disbanded because all invites expired and the party was empty.");

// Event handler for detecting when a player leaves the party (/p leave)
register("chat", () => {
    inParty = false;
    isLeader = false;
}).setCriteria("You left the party.");


// --- TRACK PARTY LEADER ---

// Event handler for detecting party leadership transfers
register("chat", (player1, player2) => {
    isLeader = ign === getPlayerName(player1);
}).setCriteria("The party was transferred to ${player1} by ${player2}");

// Event handler for detecting party leadership transfers due to player leaving
register("chat", (player1, player2) => {
    isLeader = ign === getPlayerName(player1);
}).setCriteria("The party was transferred to ${player1} because ${player2} left");

// Event handler for detecting party leadership transfers due to promotion
register("chat", (player1, player2) => {
    isLeader = ign === getPlayerName(player2);
}).setCriteria("${player1} has promoted ${player2} to Party Leader");

// Event handler for detecting the first party invite (player1 invites player2)
register("chat", (player1, player2) => {
    isLeader = ign === getPlayerName(player1);
    inParty = true;
}).setCriteria("${player1} invited ${player2} to the party! They have 60 seconds to accept.");


// --- TRACK PARTY INTERACTIONS ---

// Event handler for detecting when a player first joins the party
register("chat", (player) => {
    isLeader = false;
    inParty = true;
}).setCriteria("You have joined ${player}'s party!");

// Event handler for detecting when a player is kicked from the party
register("chat", () => {
    inParty = false;
}).setCriteria("You have been kicked from the party by ${player}");


// --- CONTROL FOR GAME/CT RS ---

// Event handler for game load
register("gameLoad", () => {
    ign = Player.getName();
    detecting = true;
    delay(() => { ChatLib.command("p list"); }, 500);
    delay(() => { detecting = false; }, 1000);
});

// Event handler for detecting game chat message (Welcomes players to Hypixel SkyBlock)
register("chat", () => {
    ign = Player.getName();
    detecting = true;
    delay(() => { ChatLib.command("p list"); }, 500);
    delay(() => { detecting = false; }, 1000);
}).setCriteria("Welcome to Hypixel SkyBlock!");

// Remove message on restart
register("chat", (leader) => {
    isLeader = ign === getPlayerName(leader);
    inParty = true;
}).setCriteria("Party Leader: ${leader} ●");

// Cancel event when detecting is in progress to avoid unintended interactions with other chat events
register("chat", (event) => {
    if (detecting)
        cancel(event);
});
