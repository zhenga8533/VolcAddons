import axios from "../../axios";
import { AQUA, BOLD, GOLD, GRAY, GREEN, ITALIC, LOGO, RED, RESET } from '../utils/constants';
import { data } from '../utils/variables';

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
    "REAPER_PEPPER": [0, 0]
}
let products = {};
const BZ_API = 'https://api.slothpixel.me/api/skyblock/bazaar/' + Object.keys(items).join(",");

// Inferno Minion Action Speed Upgrade per Minion Tier
const INFERNO_ACTION_UPGRADE = 34.5;
const INFERNO_ACTION_BASE = 1102 + INFERNO_ACTION_UPGRADE;

// Gets BZ Pricing for "items"
function getPricing() {
    axios.get(BZ_API).then(response => {
        products = response.data;

        Object.keys(items).forEach((itemID) => {
            const instaPrice = products[itemID].sell_summary[0].pricePerUnit;
            const orderPrice = products[itemID].buy_summary[0].pricePerUnit;

            items[itemID] = [instaPrice, orderPrice];
        })
    })
}

// Initial Setup
getPricing();

// Rounds number and adds commas
function formatInt(num) {
    return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/*  HYPERGOLIC GABAGOOL:
    2404 Enchanted Coal
    150.25 Enchanted Sulphur
    13824 Crude Gabagool

    Type 0 = Insta Buy
    Type 1 = Buy Order
*/
function calcHypergolic(type) {
    return 2404 * items.ENCHANTED_COAL[type] + 150.25 * items.ENCHANTED_SULPHUR[type] + 13824 * items.CRUDE_GABAGOOL[type];
}

export function calculate(args) {
    // Update Pricing
    getPricing();

    // Universal variables
    const minions = isNaN(args[2]) ? 31 : args[2];
    const tier = isNaN(args[3]) ? 3 : args[3];
    let actionSpeed = (INFERNO_ACTION_BASE - (tier * INFERNO_ACTION_UPGRADE)) / 3.41;

    switch (args[1]) {
        case "hypergolic":
        case "hg":
            const instaHypergolic = calcHypergolic(1);
            const orderHypergolic = calcHypergolic(0);
            const instaSellProfit = formatInt(items.HYPERGOLIC_GABAGOOL[0] - instaHypergolic);
            const instaOrderProfit = formatInt(items.HYPERGOLIC_GABAGOOL[1] - instaHypergolic);
            const orderInstaProfit = formatInt(items.HYPERGOLIC_GABAGOOL[0] - orderHypergolic);
            const orderOfferProfit = formatInt(items.HYPERGOLIC_GABAGOOL[1] - orderHypergolic);

            ChatLib.chat(`\n${GOLD}${BOLD}Insta Buy Price: ${RESET}${formatInt(instaHypergolic)}`);
            ChatLib.chat(`${GOLD}${BOLD}Insta Buy Profit (Insta Sell): ${RESET}${instaSellProfit}`);
            ChatLib.chat(`${GOLD}${BOLD}Insta Buy Profit (Sell Offer): ${RESET}${instaOrderProfit}`);
            ChatLib.chat(`${GREEN}${BOLD}Buy Order Price: ${RESET}${formatInt(orderHypergolic)}`);
            ChatLib.chat(`${GREEN}${BOLD}Buy Order Profit (Insta Sell): ${RESET}${orderInstaProfit}`);
            ChatLib.chat(`${GREEN}${BOLD}Buy Order Profit (Sell Offer): ${RESET}${orderOfferProfit}\n`);
            break;
        /*  INFERNO MINION LOOT TABLE:
            Chili Pepper 1/156
            Inferno Vertex 1/16,364
            Inferno Apex 1/1,570,909
            Reaper Pepper 1/458,182

            Minion Speed:
            base / (21 * (1 + flyCatchers + minExpander + infusion + beacon + powerCrystal + risingCelsius))
            base / 71.61 for MAX UPGRADES
        */
        case "inferno": // INFERNO MINION PROFIT
            const eyedrop = 1.3;
            actionSpeed /= 21;

            // Drops
            const actions = minions * 86400 / (2 * actionSpeed);
            const drops = {
                "GABAGOOL": actions.toFixed(4),
                "CHILI": (eyedrop * actions / 156).toFixed(4),
                "VERTEX": (eyedrop * actions / 16364).toFixed(4),
                "APEX": (eyedrop * actions / 1570909).toFixed(4),
                "REAPER": (eyedrop * actions / 458182).toFixed(4)
            }
            const profit = {
                "GABAGOOL": drops.GABAGOOL * items.CRUDE_GABAGOOL[1],
                "CHILI": drops.CHILI * items.CHILI_PEPPER[1],
                "VERTEX": drops.VERTEX * items.INFERNO_VERTEX[1],
                "APEX": drops.APEX * data.apexPrice,
                "REAPER": drops.REAPER * items.REAPER_PEPPER[1]
            };

            // Fuel + Net Gain (Hydra Heads hard coded for now, I'll update once I get around to it :skull:)
            const fuel = minions * (items.HYPERGOLIC_GABAGOOL[0] + 6 * items.CRUDE_GABAGOOL_DISTILLATE[0] + 2 * items.INFERNO_FUEL_BLOCK[0] + 800000);
            const net = Object.values(profit).reduce((a, c) => a + c, 0) - fuel;

            // ChatLib the values
            ChatLib.chat(`\n${GOLD}${BOLD}Average Profit for ${minions} Inferno Minion(s) t${tier}`);
            ChatLib.chat(`${AQUA}${BOLD}Crude Gabagool ${GRAY}${BOLD}[${drops.GABAGOOL}]${AQUA}: ${RESET}${formatInt(profit.GABAGOOL)}`);
            ChatLib.chat(`${AQUA}${BOLD}Chili Pepper ${GRAY}${BOLD}[${drops.CHILI}]${AQUA}: ${RESET}${formatInt(profit.CHILI)}`);
            ChatLib.chat(`${AQUA}${BOLD}Inferno Vertex ${GRAY}${BOLD}[${drops.VERTEX}]${AQUA}: ${RESET}${formatInt(profit.VERTEX)}`);
            ChatLib.chat(`${AQUA}${BOLD}Inferno Apex ${GRAY}${BOLD}[${drops.APEX}]${AQUA}: ${RESET}${formatInt(profit.APEX)}`);
            ChatLib.chat(`${AQUA}${BOLD}Reaper Pepper ${GRAY}${BOLD}[${drops.REAPER}]${AQUA}: ${RESET}${formatInt(profit.REAPER)}\n`);
            ChatLib.chat(`${RED}${BOLD}Fuel Price: ${RESET}${formatInt(fuel)}`);
            ChatLib.chat(`${GREEN}${BOLD}Total Profit: ${RESET}${formatInt(net)}\n`);
            break;
        case "gabagool": // GABAGOOL!!!
            // Heavy 15x
            actionSpeed /= 16;
            const heavyGabagool = minions * 86400 / (2 * actionSpeed) * items.CRUDE_GABAGOOL[1];
            const heavyPrice = minions * (items.HEAVY_GABAGOOL[0] + 6 * items.CRUDE_GABAGOOL_DISTILLATE[0] + 2 * items.INFERNO_FUEL_BLOCK[0]);
            const heavyProfit = heavyGabagool - heavyPrice;

            // Fuel 10x
            actionSpeed *= 1.6;
            const fuelGabgool = minions * 86400 / (2 * actionSpeed) * items.CRUDE_GABAGOOL[1];
            const fuelPrice = minions * (items.FUEL_GABAGOOL[0] + 6 * items.CRUDE_GABAGOOL_DISTILLATE[0] + 2 * items.INFERNO_FUEL_BLOCK[0]);
            const fuelProfit = fuelGabgool - fuelPrice;

            // Format ChatLib.chat
            ChatLib.chat(`\n${GOLD}${BOLD}Average Profit for ${minions} Inferno Minion(s) t${tier}`);
            ChatLib.chat(`${AQUA}${BOLD}Heavy Gabagool Drops: ${RESET}${formatInt(heavyGabagool)}`);
            ChatLib.chat(`${RED}${BOLD}Heavy Gabagool Cost: ${RESET}${formatInt(heavyPrice)}`);
            ChatLib.chat(`${GREEN}${BOLD}Heavy Gabagool Profit: ${RESET}${formatInt(heavyProfit)}\n`);
            ChatLib.chat(`${AQUA}${BOLD}Fuel Gabagool Drops: ${RESET}${formatInt(fuelGabgool)}`);
            ChatLib.chat(`${RED}${BOLD}Fuel Gabagool Cost: ${RESET}${formatInt(fuelPrice)}`);
            ChatLib.chat(`${GREEN}${BOLD}Fuel Gabagool Profit: ${RESET}${formatInt(fuelProfit)}\n`);
            break;
        default:
            ChatLib.chat(`${LOGO} ${AQUA}Please enter as /va calc <hypergolic, <inferno, gabagool> ${ITALIC}[minions] [tier]${RESET}${AQUA}>`);
            break;
    }
};

// Set Apex Price
export function setApex(args) {
    data.apexPrice = isNaN(args[1]) ? data.apexPrice : args[1];
    ChatLib.chat(`${LOGO} ${GREEN}Successfully changed Apex price to ${formatInt(data.apexPrice)}!`);
}