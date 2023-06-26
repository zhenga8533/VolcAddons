import { AQUA, BOLD, GOLD, GRAY, GREEN, ITALIC, LOGO, RED, RESET } from '../../utils/constants';
import { data } from '../../utils/variables';

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
}
let products = {};
const BZ_API = 'https://api.slothpixel.me/api/skyblock/bazaar/' + Object.keys(items).join(",");

// Minion Action Speed per Minion Tier
const INFERNO_ACTION_UPGRADE = 34.5;
const INFERNO_ACTION_BASE = 1102 + INFERNO_ACTION_UPGRADE;
const VAMPIRE_ACTIONS = [190, 175, 160, 140, 117, 95];

// 1 (base) + 0.4 (2 flycatchers) + 0.11 (beacon) + 0.1 (mithril infusion) = 1.61
const MAX_UPGRADES = 1.41;
const MAX_INFERNO = 3.41;
const MAX_CATALYST = 6.44;
/*  Other potention upgrades:
    +1.8 (inferno minions)
    -0.2 (super compacter)
    *10/15/20 (inferno fuel)
    *4 (hyper catalyst)
*/

// Other Global Constants
const DAY_SECONDS = 86400;
const PSA = `${GRAY}${ITALIC}Note that these calculations are done with max upgrades!\n`;

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
    const tier = isNaN(args[3]) || args[3] > 11 ? 3 : args[3];
    let infernoAction = (INFERNO_ACTION_BASE - (tier * INFERNO_ACTION_UPGRADE)) / MAX_INFERNO;
    const vampAction = DAY_SECONDS / (VAMPIRE_ACTIONS[Math.ceil(tier/2) - 1]*2/MAX_CATALYST) * minions;

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
            infernoAction /= 21;

            // Drops
            const actions = minions * DAY_SECONDS / (2 * infernoAction);

            const drops = {
                "GABAGOOL": actions.toFixed(4),
                "CHILI": (actions / (156 / eyedrop)).toFixed(4),
                "VERTEX": (actions / (16364 / eyedrop)).toFixed(4),
                "APEX": (actions / (1570909 / eyedrop)).toFixed(4),
                "REAPER": (actions / (458182 / eyedrop)).toFixed(4)
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
            ChatLib.chat(`${GREEN}${BOLD}Total Profit: ${RESET}${formatInt(net)}\n${PSA}`);
            break;
        case "gabagool": // GABAGOOL!!!
            // Heavy 15x
            infernoAction /= 16;
            const heavyGabagool = minions * 86400 / (2 * infernoAction) * items.CRUDE_GABAGOOL[1];
            const heavyPrice = minions * (items.HEAVY_GABAGOOL[0] + 6 * items.CRUDE_GABAGOOL_DISTILLATE[0] + 2 * items.INFERNO_FUEL_BLOCK[0]);
            const heavyProfit = heavyGabagool - heavyPrice;

            // Fuel 10x
            infernoAction *= 1.6;
            const fuelGabgool = minions * 86400 / (2 * infernoAction) * items.CRUDE_GABAGOOL[1];
            const fuelPrice = minions * (items.FUEL_GABAGOOL[0] + 6 * items.CRUDE_GABAGOOL_DISTILLATE[0] + 2 * items.INFERNO_FUEL_BLOCK[0]);
            const fuelProfit = fuelGabgool - fuelPrice;

            // Format ChatLib.chat
            ChatLib.chat(`\n${GOLD}${BOLD}Average Profit for ${minions} Inferno Minion(s) t${tier}`);
            ChatLib.chat(`${AQUA}${BOLD}Heavy Gabagool Drops: ${RESET}${formatInt(heavyGabagool)}`);
            ChatLib.chat(`${RED}${BOLD}Heavy Gabagool Cost: ${RESET}${formatInt(heavyPrice)}`);
            ChatLib.chat(`${GREEN}${BOLD}Heavy Gabagool Profit: ${RESET}${formatInt(heavyProfit)}\n`);
            ChatLib.chat(`${AQUA}${BOLD}Fuel Gabagool Drops: ${RESET}${formatInt(fuelGabgool)}`);
            ChatLib.chat(`${RED}${BOLD}Fuel Gabagool Cost: ${RESET}${formatInt(fuelPrice)}`);
            ChatLib.chat(`${GREEN}${BOLD}Fuel Gabagool Profit: ${RESET}${formatInt(fuelProfit)}\n${PSA}`);
            break;
        case "vampire":
        case "vamp":
            const hemovibe = [(vampAction).toFixed(4), vampAction*items.HEMOVIBE[1]];
            const hemoglass = [(hemovibe[0]/160).toFixed(4), hemovibe[0]/160*items.HEMOGLASS[1]];
            const hemobomb = [(hemoglass[0]/15).toFixed(4), hemoglass[0]/15*items.HEMOBOMB[1]];
            const vampCost = items.HYPER_CATALYST[0] * 4 * minions;
            const vampProfit = hemovibe[1] - vampCost;
            
            ChatLib.chat(`\n${GOLD}${BOLD}Drops for ${minions} Vampire Minion(s) t${tier}`);
            ChatLib.chat(`${AQUA}${BOLD}Hemovibe ${GRAY}${BOLD}[${hemovibe[0]}]${AQUA}: ${RESET}${formatInt(hemovibe[1])}`);
            ChatLib.chat(`${AQUA}${BOLD}Hemoglass ${GRAY}${BOLD}[${hemoglass[0]}]${AQUA}: ${RESET}${formatInt(hemoglass[1])}`);
            ChatLib.chat(`${AQUA}${BOLD}Hemobomb ${GRAY}${BOLD}[${hemobomb[0]}]${AQUA}: ${RESET}${formatInt(hemobomb[1])}`);
            ChatLib.chat(`${RED}${BOLD}Hyper Catalyst Cost: ${RESET}${formatInt(vampCost)}`);
            ChatLib.chat(`${GREEN}${BOLD}Total Profit: ${RESET}${formatInt(vampProfit)}\n${PSA}`);
            break;
        default:
            ChatLib.chat(`${LOGO} ${AQUA}Please enter as /va calc <hypergolic, <inferno, gabagool, vampire> ${ITALIC}[minions] [tier]${RESET}${AQUA}>`);
            break;
    }
};

// Set Apex Price
export function setApex(args) {
    data.apexPrice = isNaN(args[1]) ? data.apexPrice : args[1];
    ChatLib.chat(`${LOGO} ${GREEN}Successfully changed Apex price to ${formatInt(data.apexPrice)}!`);
}
