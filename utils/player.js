import { data } from "./variables";


/**
 * Returns whether the player is MVP+ or MVP++ based on chat messages.
 *
 * @returns {boolean} - Whether the player is MVP+ or MVP++.
 */
let isMVP = false;
export function getMVP() { return isMVP }

// Event handler for chat messages to check MVP status
register("chat", (player) => {
    isMVP = player === Player.getName();
}).setCriteria(">>> [MVP++] ${player} joined the lobby! <<<");

// Event handler for detecting the player's profile ID from a chat message and update API data.
register("chat", (id) => {
    data.lastID = id;
}).setCriteria("Profile ID: ${id}");
