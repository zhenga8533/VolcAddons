import axios from "../../../axios";

// ID : [INSTA BUY, SELL OFFER]
let items = {
    // Hypergolic Fuel Stuff
    "ENCHANTED_COAL": [0, 0],
    "ENCHANTED_SULPHUR": [0, 0],
    "CRUDE_GABAGOOL": [0, 0],
    "HYPERGOLIC_GABAGOOL": [0, 0],
    "HEAVY_GABAGOOL": [0, 0],
    "FUEL_GABAGOOL": [0, 0],
    "CRUDE_GABAGOOL_DISTILLATE": [0, 0],
    "INFERNO_FUEL_BLOCK": [0, 0],
    // Inferno Minion Loot
    "CHILI_PEPPER": [0, 0],
    "INFERNO_VERTEX": [0, 0],
    "REAPER_PEPPER": [0, 0],
    // Vampire Minion Stuff
    "HYPER_CATALYST": [0, 0],
    "HEMOVIBE": [0, 0],
    "HEMOGLASS": [0, 0],
    "HEMOBOMB": [0, 0],
    // Composter
    "BOX_OF_SEEDS": [0, 0],
    "OIL_BARREL": [0, 0],
    "COMPOST": [0, 0],
}
const BZ_API = 'https://api.slothpixel.me/api/skyblock/bazaar/' + Object.keys(items).join(",");

// Gets BZ Pricing for "items"
function getPricing() {
    axios.get(BZ_API).then(response => {
        let products = response.data;

        Object.keys(items).forEach((itemID) => {
            const instaPrice = products[itemID].sell_summary[0].pricePerUnit;
            const orderPrice = products[itemID].buy_summary[0].pricePerUnit;

            items[itemID] = [instaPrice, orderPrice];
        })
    })
}

// Initial Setup
getPricing();