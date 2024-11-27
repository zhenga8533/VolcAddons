import request from "../../../requestV2";
import { GREEN, LOGO } from "../../utils/Constants";
import { data } from "../../utils/Data";
import { Json } from "../../utils/Json";

/**
 * Variables used to generate and record Skyblock economy pricing.
 */
const auction = new Json("auction.json", true);
export function getAuction() {
  return auction.getData();
}
const bazaar = new Json("bazaar.json", true);
export function getBazaar() {
  return bazaar.getData();
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
      if (!response.items) return;
      auction.setData(response.items);
      const items = auction.getData();
      Object.keys(data.valuelist).forEach((key) => (items[key] = { lbin: data.valuelist[key] }));
    })
    .catch((err) => console.error(`VolcAddons: ${err.cause ?? err}`));
}
function updateBazaar() {
  request({
    url: "https://volcaronitee.pythonanywhere.com/bazaar",
    json: true,
  })
    .then((response) => {
      if (!response.items) return;
      bazaar.setData(response.items);
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
