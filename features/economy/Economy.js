import request from "../../../requestV2";
import settings from "../../settings";
import { GREEN, LOGO } from "../../utils/constants";
import { registerWhen } from "../../utils/variables";


/**
 * Variables used to generate and record Skyblock economy pricing.
 */
let items = {};
export function getAuction() { return items };
let products = {};
export function getBazaar() { return products };

/**
 * Makes a PULL request to update economy data.
 */
function updateAuction() {
    request({
        url: "https://volcaronitee.pythonanywhere.com/auction",
        json: true
    }).then((response) => {
        items = response.items;
    }).catch((error) => {
        console.error(error);
    });
}
updateAuction();
function updateBazaar() {
    request({
        url: "https://volcaronitee.pythonanywhere.com/bazaar",
        json: true
    }).then((response) => {
        products = response.items;
    }).catch((error) => {
        console.error(error);
    });
}
updateBazaar();

/**
 * Calls for an auction house reloop every X minutes.
 */
let minutes = 0
registerWhen(register("step", () => {
    minutes++;

    if (minutes >= settings.economyRefresh) {
        updateAuction();
        updateBazaar();
        minutes = 0;
    }
}).setDelay(60), () => settings.economyRefresh !== 0);

/**
 * Updates auction and bazaar data and notifies the user upon successful update.
 */
register("command", () => {
    updateAuction();
    updateBazaar();
    ChatLib.chat(`${LOGO} ${GREEN}Successfully updated Auction and Bazaar!`);
}).setName("updateEconomy");
