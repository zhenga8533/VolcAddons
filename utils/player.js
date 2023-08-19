// Import required modules and constants
import request from "../../requestV2";
import { data } from "./variables";


// --- Get Player Rank ---

// MVP++ Check
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


// --- Get Player UUID ---

// Variable to store the player's UUID, initially set to undefined.
let uuid = undefined;

/**
 * Gets the player's UUID.
 *
 * @returns {string|undefined} - The player's UUID, or undefined if not fetched yet.
 */
export function getPlayerUUID() {
    return uuid;
}

// Make an API request to Mojang to get the player's UUID based on their in-game name.
request({
    url: `https://api.mojang.com/users/profiles/minecraft/${Player.getName()}`,
    json: true
}).then((response) => {
    // Update the 'uuid' variable with the player's UUID from the API response.
    uuid = response.id;
}).catch((error) => {
    console.error(error);
});


// --- Get Profile ID ---

// Event handler for detecting the player's profile ID from a chat message.
register("chat", (id) => {
    data.profileId = id;
}).setCriteria("Profile ID: ${id}");
