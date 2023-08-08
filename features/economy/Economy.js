import request from "../../../requestV2";
import settings from "../../settings";
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
        url: `http://volcaronitee.pythonanywhere.com/auction`,
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
        url: `http://volcaronitee.pythonanywhere.com/bazaar`,
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
}).setDelay(60), () => settings.economyRefresh);
register("command", () => {
    updateAuction();
    updateBazaar();
}).setName("updateEconomy");
