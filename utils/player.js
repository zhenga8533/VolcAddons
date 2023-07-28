import request from "../../requestV2";
import settings from "../settings";
import { LOGO, RED } from "./constants";
import { data } from "./variables";


// Get player UUID
let uuid = undefined;
export function getPlayerUUID() { return uuid };
request({
    url: `https://api.mojang.com/users/profiles/minecraft/${Player.getName()}`,
    json: true
}).then((response)=>{
    uuid = response.id;
}).catch((error)=>{
    console.error(error);
});

// Get profile ID
register("chat", (id) => {
    data.profileId = id;
}).setCriteria("Profile ID: ${id}");

// Bestiary
let bestiary = undefined;

/**
 * Makes a PULL request to get bestiary data from player info from Hypixel API.
 */
export function updateBestiary() {
    request({
        url: `https://api.hypixel.net/skyblock/profile?key=${settings.apiKey}&profile=${data.profileId}`,
        json: true
    }).then((response)=>{
        bestiary = response.profile.members[getPlayerUUID()].bestiary;
    }).catch((error)=>{
        ChatLib.chat(`${LOGO} ${RED}${error.cause}`);
    });
}
