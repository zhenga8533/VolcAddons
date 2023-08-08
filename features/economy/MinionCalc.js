import { AQUA, BOLD, GOLD, GRAY, GREEN, ITALIC, RED, RESET } from '../../utils/constants';
import { commafy } from "../../utils/functions";
import { data } from '../../utils/variables';
import { getBazaar } from './Economy';


/**
 * Variables used to represent minion upgrades and action speeds.
 */
const INFERNO_ACTION_UPGRADE = 34.5;
const INFERNO_ACTION_BASE = 1102 + INFERNO_ACTION_UPGRADE;
const VAMPIRE_ACTIONS = [190, 175, 160, 140, 117, 95];
/**
 * 1 (base) + 0.4 (2 flycatchers) + 0.11 (beacon) + 0.1 (mithril infusion) = 1.61
 * 
 * Other potention upgrades:
 * +1.8 (inferno minions)
 * -0.2 (super compacter)
 * 10/15/20 (inferno fuel)
 * 4 (hyper catalyst)
 */
const MAX_UPGRADES = 1.41;
const MAX_INFERNO = 3.41;
const MAX_CATALYST = 6.44;
const PSA = `${GRAY}${ITALIC}Note that these calculations are done with max upgrades!\n`;

/**
 * Hypergolic gabagool calculation.
 * 
 * HYPERGOLIC GABAGOOL:
 * 2404 Enchanted Coal
 * 150.25 Enchanted Sulphur
 * 13824 Crude Gabagool
 *
 * Type 0 = Insta Buy
 * Type 1 = Buy Order
 *
 * @param {string} type - Sound category.
 */
function calcHypergolic(bazaar, type) {
    return 2404 * bazaar.ENCHANTED_COAL[type] + 150.25 * bazaar.ENCHANTED_SULPHUR[type] + 13824 * bazaar.CRUDE_GABAGOOL[type];
}

/**
 * Displays different minion calculations depending on player input.
 *
 * @param {string[]} args - Array of player input values.
 */
export function calcMinions(args) {
    // Update Prices
    const bazaar = getBazaar();

    // Universal variables
    const minions = isNaN(args[2]) ? 31 : args[2];
    const tier = isNaN(args[3]) || args[3] > 11 ? 3 : args[3];
    let infernoAction = (INFERNO_ACTION_BASE - (tier * INFERNO_ACTION_UPGRADE)) / MAX_INFERNO;
    const vampAction = 86400 / (VAMPIRE_ACTIONS[Math.ceil(tier/2) - 1]*2/MAX_CATALYST) * minions;

    // Different Calcs
    switch (args[1]) {
        case "hypergolic":
        case "hg":
            const instaHypergolic = calcHypergolic(1);
            const orderHypergolic = calcHypergolic(0);
            const instaSellProfit = commafy(bazaar.HYPERGOLIC_GABAGOOL[0] - instaHypergolic);
            const instaOrderProfit = commafy(bazaar.HYPERGOLIC_GABAGOOL[1] - instaHypergolic);
            const orderInstaProfit = commafy(bazaar.HYPERGOLIC_GABAGOOL[0] - orderHypergolic);
            const orderOfferProfit = commafy(bazaar.HYPERGOLIC_GABAGOOL[1] - orderHypergolic);

            ChatLib.chat(`\n${GOLD}${BOLD}Insta Buy Price: ${RESET}${commafy(instaHypergolic)}`);
            ChatLib.chat(`${GOLD}${BOLD}Insta Buy Profit (Insta Sell): ${RESET}${instaSellProfit}`);
            ChatLib.chat(`${GOLD}${BOLD}Insta Buy Profit (Sell Offer): ${RESET}${instaOrderProfit}`);
            ChatLib.chat(`${GREEN}${BOLD}Buy Order Price: ${RESET}${commafy(orderHypergolic)}`);
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
            const actions = minions * 86400 / (2 * infernoAction);

            const drops = {
                "GABAGOOL": actions.toFixed(4),
                "CHILI": (actions / (156 / eyedrop)).toFixed(4),
                "VERTEX": (actions / (16364 / eyedrop)).toFixed(4),
                "APEX": (actions / (1570909 / eyedrop)).toFixed(4),
                "REAPER": (actions / (458182 / eyedrop)).toFixed(4)
            }
            const profit = {
                "GABAGOOL": drops.GABAGOOL * bazaar.CRUDE_GABAGOOL[1],
                "CHILI": drops.CHILI * bazaar.CHILI_PEPPER[1],
                "VERTEX": drops.VERTEX * bazaar.INFERNO_VERTEX[1],
                "APEX": drops.APEX * data.apexPrice,
                "REAPER": drops.REAPER * bazaar.REAPER_PEPPER[1]
            };

            // Fuel + Net Gain (Hydra Heads hard coded for now, I'll update once I get around to it :skull:)
            const fuel = minions * (bazaar.HYPERGOLIC_GABAGOOL[0] + 6 * bazaar.CRUDE_GABAGOOL_DISTILLATE[0] + 2 * bazaar.INFERNO_FUEL_BLOCK[0] + 800000);
            const net = Object.values(profit).reduce((a, c) => a + c, 0) - fuel;

            // ChatLib the values
            ChatLib.chat(`\n${GOLD}${BOLD}Average Profit for ${minions} Inferno Minion(s) t${tier}`);
            ChatLib.chat(`${AQUA}${BOLD}Crude Gabagool ${GRAY}${BOLD}[${drops.GABAGOOL}]${AQUA}: ${RESET}${commafy(profit.GABAGOOL)}`);
            ChatLib.chat(`${AQUA}${BOLD}Chili Pepper ${GRAY}${BOLD}[${drops.CHILI}]${AQUA}: ${RESET}${commafy(profit.CHILI)}`);
            ChatLib.chat(`${AQUA}${BOLD}Inferno Vertex ${GRAY}${BOLD}[${drops.VERTEX}]${AQUA}: ${RESET}${commafy(profit.VERTEX)}`);
            ChatLib.chat(`${AQUA}${BOLD}Inferno Apex ${GRAY}${BOLD}[${drops.APEX}]${AQUA}: ${RESET}${commafy(profit.APEX)}`);
            ChatLib.chat(`${AQUA}${BOLD}Reaper Pepper ${GRAY}${BOLD}[${drops.REAPER}]${AQUA}: ${RESET}${commafy(profit.REAPER)}\n`);
            ChatLib.chat(`${RED}${BOLD}Fuel Price: ${RESET}${commafy(fuel)}`);
            ChatLib.chat(`${GREEN}${BOLD}Total Profit: ${RESET}${commafy(net)}\n${PSA}`);
            break;
        case "gabagool": // GABAGOOL!!!
        case "gaba":
            // Heavy 15x
            infernoAction /= 16;
            const heavyGabagool = minions * 86400 / (2 * infernoAction) * bazaar.CRUDE_GABAGOOL[1];
            const heavyPrice = minions * (bazaar.HEAVY_GABAGOOL[0] + 6 * bazaar.CRUDE_GABAGOOL_DISTILLATE[0] + 2 * bazaar.INFERNO_FUEL_BLOCK[0]);
            const heavyProfit = heavyGabagool - heavyPrice;

            // Fuel 10x
            infernoAction *= 1.6;
            const fuelGabgool = minions * 86400 / (2 * infernoAction) * bazaar.CRUDE_GABAGOOL[1];
            const fuelPrice = minions * (bazaar.FUEL_GABAGOOL[0] + 6 * bazaar.CRUDE_GABAGOOL_DISTILLATE[0] + 2 * bazaar.INFERNO_FUEL_BLOCK[0]);
            const fuelProfit = fuelGabgool - fuelPrice;

            // Format ChatLib.chat
            ChatLib.chat(`\n${GOLD}${BOLD}Average Profit for ${minions} Inferno Minion(s) t${tier}`);
            ChatLib.chat(`${AQUA}${BOLD}Heavy Gabagool Drops: ${RESET}${commafy(heavyGabagool)}`);
            ChatLib.chat(`${RED}${BOLD}Heavy Gabagool Cost: ${RESET}${commafy(heavyPrice)}`);
            ChatLib.chat(`${GREEN}${BOLD}Heavy Gabagool Profit: ${RESET}${commafy(heavyProfit)}\n`);
            ChatLib.chat(`${AQUA}${BOLD}Fuel Gabagool Drops: ${RESET}${commafy(fuelGabgool)}`);
            ChatLib.chat(`${RED}${BOLD}Fuel Gabagool Cost: ${RESET}${commafy(fuelPrice)}`);
            ChatLib.chat(`${GREEN}${BOLD}Fuel Gabagool Profit: ${RESET}${commafy(fuelProfit)}\n${PSA}`);
            break;
        case "vampire":
        case "vamp":
            const hemovibe = [(vampAction).toFixed(4), vampAction*bazaar.HEMOVIBE[1]];
            const hemoglass = [(hemovibe[0]/160).toFixed(4), hemovibe[0]/160*bazaar.HEMOGLASS[1]];
            const hemobomb = [(hemoglass[0]/15).toFixed(4), hemoglass[0]/15*bazaar.HEMOBOMB[1]];
            const vampCost = bazaar.HYPER_CATALYST[0] * 4 * minions;
            const vampProfit = hemovibe[1] - vampCost;
            
            ChatLib.chat(`\n${GOLD}${BOLD}Drops for ${minions} Vampire Minion(s) t${tier}`);
            ChatLib.chat(`${AQUA}${BOLD}Hemovibe ${GRAY}${BOLD}[${hemovibe[0]}]${AQUA}: ${RESET}${commafy(hemovibe[1])}`);
            ChatLib.chat(`${AQUA}${BOLD}Hemoglass ${GRAY}${BOLD}[${hemoglass[0]}]${AQUA}: ${RESET}${commafy(hemoglass[1])}`);
            ChatLib.chat(`${AQUA}${BOLD}Hemobomb ${GRAY}${BOLD}[${hemobomb[0]}]${AQUA}: ${RESET}${commafy(hemobomb[1])}`);
            ChatLib.chat(`${RED}${BOLD}Hyper Catalyst Cost: ${RESET}${commafy(vampCost)}`);
            ChatLib.chat(`${GREEN}${BOLD}Total Profit: ${RESET}${commafy(vampProfit)}\n${PSA}`);
            break;
    }
}
