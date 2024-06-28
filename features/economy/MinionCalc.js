import {
  AQUA,
  BOLD,
  DARK_AQUA,
  DARK_GRAY,
  GOLD,
  GRAY,
  GREEN,
  ITALIC,
  LOGO,
  RED,
  RESET,
  UNDERLINE,
  WHITE,
} from "../../utils/Constants";
import Settings from "../../utils/Settings";
import { commafy, formatNumber } from "../../utils/functions/format";
import { getBazaar } from "./Economy";

/**
 * Variables used to represent minion upgrades.
 */
const INFERNO_ACTION_UPGRADE = 34.5;
const INFERNO_ACTION_BASE = 1102 + INFERNO_ACTION_UPGRADE;
const VAMPIRE_ACTIONS = [190, 175, 160, 140, 117, 95];

/**
 * Variables used to represent minion action speeds.
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
const PSA = `${GRAY + ITALIC}Note that these calculations are done with max upgrades!\n`;

/**
 * Hypergolic gabagool calculation.
 *
 * HYPERGOLIC GABAGOOL:
 * 1202 Enchanted Coal * 31 = 37262
 * 75.125 Enchanted Sulphur * 31 = 2328.875
 * 6912 Crude Gabagool * 31 = 214272
 *
 * Type 0 = Insta Buy
 * Type 1 = Buy Order
 *
 * @param {String} type - Sound category.
 */
function calcHypergolic(type) {
  const bazaar = getBazaar();
  return (
    1202 * bazaar.ENCHANTED_COAL[type] + 75.125 * bazaar.ENCHANTED_SULPHUR[type] + 6912 * bazaar.CRUDE_GABAGOOL[type]
  );
}

/**
 * Displays different minion calculations depending on player input.
 *
 * @param {String[]} args - Array of player input values.
 */
export function calcMinions(args) {
  // Update Prices
  const bazaar = getBazaar();

  // Universal variables
  const minions = isNaN(args[2]) ? 31 : args[2];
  const tier = isNaN(args[3]) || args[3] > 11 ? 3 : args[3];
  let infernoAction = (1.1 * (INFERNO_ACTION_BASE - tier * INFERNO_ACTION_UPGRADE)) / MAX_INFERNO;
  const vampAction = (86400 / ((VAMPIRE_ACTIONS[Math.ceil(tier / 2) - 1] * 2) / MAX_CATALYST)) * minions;

  // Different Calcs
  switch (args[1]) {
    case "hypergolic":
    case "hg":
      const hypergolic = bazaar.HYPERGOLIC_GABAGOOL;
      const orderHypergolic = calcHypergolic(0);
      const instaHypergolic = calcHypergolic(1);
      const p1 = hypergolic[0] - orderHypergolic;
      const p2 = hypergolic[0] - instaHypergolic;
      const p3 = hypergolic[1] - orderHypergolic;
      const p4 = hypergolic[1] - instaHypergolic;

      ChatLib.chat(
        `\n${LOGO + GREEN + BOLD}Hypergolic Craft Profits:\n
${RED + BOLD + UNDERLINE}Hypergolic Gabagool Cost:
${AQUA}Insta Sell: ${WHITE + commafy(hypergolic[0])}
${AQUA}Sell Offer: ${WHITE + commafy(hypergolic[1])}\n
${GREEN + BOLD + UNDERLINE}Material Cost:
${AQUA}Buy Order: ${WHITE + commafy(orderHypergolic)}
${AQUA}Insta Buy: ${WHITE + commafy(instaHypergolic)}\n
${DARK_AQUA + BOLD + UNDERLINE}Total Profit:
${AQUA}Insta Sell + Buy Order: ${WHITE + commafy(p1)}
${AQUA}Insta Sell + Insta Buy: ${WHITE + commafy(p2)}
${AQUA}Sell Offer + Buy Order: ${WHITE + commafy(p3)}
${AQUA}Sell Offer + Insta Buy: ${WHITE + commafy(p4)}\n`
      );
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
      const actions = (minions * 86400) / (2 * infernoAction);
      const apexMinion = tier >= 10 ? 2 : 1;

      const drops = {
        GABAGOOL: actions,
        CHILI: (actions / (156 / eyedrop)) * 1.15,
        VERTEX: ((actions / (16364 / eyedrop)) * 2.8).toFixed(2),
        APEX: ((actions / (1570909 / eyedrop)) * apexMinion * 1.2).toFixed(2),
        REAPER: (actions / (458182 / eyedrop)).toFixed(2),
      };
      const profit = {
        GABAGOOL: drops.GABAGOOL * bazaar.CRUDE_GABAGOOL[1 - Settings.priceType],
        CHILI: drops.CHILI * bazaar.CHILI_PEPPER[1 - Settings.priceType],
        VERTEX: drops.VERTEX * bazaar.INFERNO_VERTEX[1 - Settings.priceType],
        APEX: drops.APEX * bazaar.INFERNO_APEX[1 - Settings.priceType],
        REAPER: drops.REAPER * bazaar.REAPER_PEPPER[1 - Settings.priceType],
      };

      // Fuel + Net Gain
      const fuel =
        minions *
        (bazaar.HYPERGOLIC_GABAGOOL[Settings.priceType] +
          6 * bazaar.CRUDE_GABAGOOL_DISTILLATE[Settings.priceType] +
          2 * bazaar.INFERNO_FUEL_BLOCK[Settings.priceType] +
          bazaar.CAPSAICIN_EYEDROPS_NO_CHARGES[Settings.priceType]);
      const net = Object.values(profit).reduce((a, c) => a + c, 0) - fuel;

      // ChatLib the values
      ChatLib.chat(
        `\n${GOLD + BOLD + minions} Inferno Minion(s) t${tier} ${DARK_GRAY + BOLD}[Hypergolic]:
${AQUA}Crude Gabagool ${GRAY}[${formatNumber(drops.GABAGOOL)}]${AQUA}: ${RESET + commafy(profit.GABAGOOL)}
${AQUA}Chili Pepper ${GRAY}[${formatNumber(drops.CHILI)}]${AQUA}: ${RESET + commafy(profit.CHILI)}
${AQUA}Inferno Vertex ${GRAY}[${drops.VERTEX}]${AQUA}: ${RESET + commafy(profit.VERTEX)}
${AQUA}Inferno Apex ${GRAY}[${drops.APEX}]${AQUA}: ${RESET + commafy(profit.APEX)}
${AQUA}Reaper Pepper ${GRAY}[${drops.REAPER}]${AQUA}: ${RESET + commafy(profit.REAPER)}\n
${RED}Fuel Price: ${RESET + commafy(fuel)}
${GREEN}Total Profit: ${RESET + commafy(net)}\n${PSA}`
      );
      break;
    case "gabagool": // GABAGOOL!!!
    case "gaba":
      // Heavy 15x
      infernoAction /= 16;
      const gabagool = (minions * 86400) / (2 * infernoAction);
      const heavyGabagool = gabagool * bazaar.CRUDE_GABAGOOL[1 - Settings.priceType];
      const heavyPrice =
        minions *
        (bazaar.HEAVY_GABAGOOL[Settings.priceType] +
          6 * bazaar.CRUDE_GABAGOOL_DISTILLATE[Settings.priceType] +
          2 * bazaar.INFERNO_FUEL_BLOCK[Settings.priceType]);
      const heavyProfit = heavyGabagool - heavyPrice;

      // Format ChatLib.chat
      ChatLib.chat(
        `\n${GOLD + BOLD}${minions} Inferno Minion(s) t${tier} ${DARK_GRAY + BOLD}[Heavy]:
${AQUA}Gabagool ${GRAY}[${commafy(gabagool)}]${AQUA}: ${RESET + commafy(heavyGabagool)}\n
${RED}Fuel Price: ${RESET + commafy(heavyPrice)}
${GREEN}Total Profit: ${RESET + commafy(heavyProfit)}\n${PSA}`
      );
      break;
    case "vampire":
    case "vamp":
      const hemovibe = [vampAction.toFixed(4), vampAction * bazaar.HEMOVIBE[1 - Settings.priceType]];
      const hemoglass = [
        (hemovibe[0] / 160).toFixed(4),
        (hemovibe[0] / 160) * bazaar.HEMOGLASS[1 - Settings.priceType],
      ];
      const hemobomb = [(hemoglass[0] / 15).toFixed(4), (hemoglass[0] / 15) * bazaar.HEMOBOMB[1 - Settings.priceType]];
      const vampCost = bazaar.HYPER_CATALYST[Settings.priceType] * 4 * minions;
      const vampProfit = hemovibe[1] - vampCost;

      ChatLib.chat(
        `\n${GOLD + BOLD}Drops for ${minions} Vampire Minion(s) t${tier}
${AQUA}Hemovibe ${GRAY}[${hemovibe[0]}]${AQUA}: ${RESET + commafy(hemovibe[1])}
${AQUA}Hemoglass ${GRAY}[${hemoglass[0]}]${AQUA}: ${RESET + commafy(hemoglass[1])}
${AQUA}Hemobomb ${GRAY}[${hemobomb[0]}]${AQUA}: ${RESET + commafy(hemobomb[1])}\n
${RED}Hyper Catalyst Cost: ${RESET + commafy(vampCost)}
${GREEN}Total Profit: ${RESET + commafy(vampProfit)}\n${PSA}`
      );
      break;
  }
}
