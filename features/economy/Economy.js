import request from "../../../requestV2";
import Settings from "../../utils/Settings";
import { GREEN, LOGO } from "../../utils/Constants";
import { registerWhen } from "../../utils/RegisterTils";
import { data } from "../../utils/Data";

/**
 * Variables used to generate and record Skyblock economy pricing.
 */
let items = {};
export function getAuction() {
  return items;
}
let products = {};
export function getBazaar() {
  return products;
}

/**
 * Makes a PULL request to update economy data.
 */
export function updateAuction() {
  request({
    url: "https://volcaronitee.pythonanywhere.com/auction",
    json: true,
  })
    .then((response) => {
      items = response.items;
      Object.keys(data.valuelist).forEach(
        (key) => (items[key] = { lbin: data.valuelist[key] })
      );
    })
    .catch((err) => console.error(`VolcAddons: ${err.cause ?? err}`));
}
function updateBazaar() {
  request({
    url: "https://volcaronitee.pythonanywhere.com/bazaar",
    json: true,
  })
    .then((response) => {
      products = response.items;
    })
    .catch((err) => console.error(`$VolcAddons: ${err.cause ?? err}`));
}
updateAuction();
updateBazaar();

/**
 * Calls for an auction house reloop every X minutes.
 */
register("step", () => {
  updateAuction();
  updateBazaar();
}).setDelay(3600);

/**
 * Updates auction and bazaar data and notifies the user upon successful update.
 */
register("command", () => {
  updateAuction();
  updateBazaar();
  ChatLib.chat(`${LOGO + GREEN}Successfully updated Auction and Bazaar!`);
}).setName("updateEconomy");
