import request from "../../requestV2";
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

/**
 * Gets the player's UUID.
 *
 * @returns {string|undefined} - The player's UUID, or undefined if not fetched yet.
 */
let uuid = undefined;
export function getPlayerUUID() { return uuid }
let updated = false;

// Make an API request to Mojang to get the player's UUID based on their in-game name.
request({
    url: `https://api.mojang.com/users/profiles/minecraft/${Player.getName()}`,
    json: true
}).then((response) => {
    // Update the 'uuid' variable with the player's UUID from the API response.
    uuid = response.id;
    if (data.lastID !== undefined) {
        updatePlayer(data.lastID);
        updated = true;
    }
}).catch(err => console.error(`VolcAddons: ${err.cause ?? err}`));

import { updateTrophy } from "../features/crimsonIsle/TrophyCounter";
import { updateSkills } from "../features/general/SkillTracker";
/**
 * Updates some player info needed by other features on launch
 * 
 * @param {String} id - Player's profile ID
 */
export function updatePlayer(id) {
    request({
        url: `https://api.hypixel.net/v2/skyblock/profile?key=4e927d63a1c34f71b56428b2320cbf95&profile=${id}`,
        json: true
    }).then((response) => {
        const data = response.profile.members[getPlayerUUID()];
        updateTrophy(data?.trophy_fish);
        updateSkills(data?.player_data?.experience);
    }).catch(err => console.error(`VolcAddons: ${err.cause ?? err}`));
}

// Event handler for detecting the player's profile ID from a chat message and update API data.
register("chat", (id) => {
    if (!updated) {
        updatePlayer(id);
        updated = true;
    }
    data.lastID = id;
}).setCriteria("Profile ID: ${id}");

register("chat", () => {
    updated = false;
}).setCriteria("Switching to profile ${cute}...");
