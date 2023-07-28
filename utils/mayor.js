import { request } from "../../requestV2";

const MAYOR_API = "https://api.hypixel.net/resources/skyblock/election";
let mayor = undefined;
export function getMayor() { return mayor };
let perks = [];
export function getPerks() { return perks };


/**
 * Makes a PULL request to get mayor info from Hypixel API.
 */
request({
    url: MAYOR_API,
    json: true
}).then((response)=>{
    mayor = response.mayor.name;
    perks = [];
    response.mayor.perks.forEach(perk => {
        perks.push(perk.name);
    });
}).catch((error)=>{
    console.error(error);
});
