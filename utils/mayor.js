import { request } from "../../requestV2";
import { DARK_RED, LOGO } from "./constants";


/**
 * Variables used to represent mayor data.
 */
const MAYOR_API = "https://api.hypixel.net/v2/resources/skyblock/election";
let mayor = undefined;
export function getMayor() { return mayor }

// An array to store the names of the mayor's perks.
let perks = new Set([]);
export function getPerks() { return perks }

/**
 * Makes a PULL request to get mayor info from Hypixel API.
 */
register("worldLoad", () => {
    request({
        url: MAYOR_API,
        json: true
    }).then(response => {
        mayor = response.mayor.name;
        perks = new Set([...response.mayor.perks.map(perk => perk.name)]);
    }).catch(err => console.error(`VolcAddons: ${err.cause ?? err}`));
});
