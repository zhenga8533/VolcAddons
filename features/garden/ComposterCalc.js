import { AQUA, BOLD, DARK_GREEN, GREEN, LOGO, RED, WHITE } from "../../utils/constants";
import { commafy, romanToNum } from "../../utils/functions";
import { data, registerWhen } from "../../utils/variables";
import { getWorld } from "../../utils/worlds";
import { getBazaar } from "../economy/Economy";


/**
 * Tracks whenever player is in the Composter Upgrades gui and saves their upgrade values.
 */
registerWhen(register("guiMouseRelease", () => {
    try {
        // Get compsoter upgrades container
        let container = Player.getContainer();
        if (container.getName() != "Composter Upgrades") return;
        
        // Get composter levels
        // Composter Speed => Sugar ID: 353
        // Multi Drop => Diamond Hoe ID: 293
        // Cost Reduction => Gold Ingot ID: 266
        const items = container.getItems();
        data.composterUpgrades["Composter Speed"] = romanToNum(items[container.indexOf(353)].getName().removeFormatting().split(" ").pop());
        data.composterUpgrades["Multi Drop"] = romanToNum(items[container.indexOf(293)].getName().removeFormatting().split(" ").pop());
        data.composterUpgrades["Cost Reduction"] = romanToNum(items[container.indexOf(266)].getName().removeFormatting().split(" ").pop());
    } catch(err) {}
}), () => getWorld() === "Garden");


/**
 * Fetches Bazaar data and performs calculations for single, hourly, and daily profits and prints to screen.
 */
export function calcCompost(args) {
    const bazaar = getBazaar();

    // Upgrades
    const testLevel = parseInt(args[2]);
    if (isNaN(testLevel) && data.composterUpgrades["Cost Reduction"] == -1) {
        ChatLib.chat(`${LOGO} ${RED}Please input as /va calc compost [level] / open you composter upgrades menu!`);
        return;
    }
    const speedUpgrade = !isNaN(testLevel) ? testLevel : data.composterUpgrades["Composter Speed"];
    const multiUpgrade = !isNaN(testLevel) ? testLevel : data.composterUpgrades["Multi Drop"];
    const costUpgrade = !isNaN(testLevel) ? testLevel : data.composterUpgrades["Cost Reduction"];

    // Organic (4k) / Fuel (2k) Cost
    // Box of Seeds give 25.6k organic
    // Oil Barrel gives 10k fuel
    const organicCost = bazaar["BOX_OF_SEEDS"][0] / (25600 / (4000 * (1 - costUpgrade/100)));
    const fuelType = bazaar["OIL_BARREL"][0] > bazaar["VOLTA"][0] ? "Volta" : "Oil Barrel";
    const fuelCost = Math.min(bazaar["OIL_BARREL"][0], bazaar["VOLTA"][0]) / (10000 / (2000 * (1 - costUpgrade/100)));
    const totalCost = Math.round(organicCost + fuelCost);

    // Profit
    const compostPrice = Math.round(bazaar["COMPOST"][1] * (1 + multiUpgrade * 0.03)); // Multi Drop => +0.03% per level
    const totalProfit = compostPrice - totalCost;

    // Daily Profit
    const time = 600 / (1 + speedUpgrade * 0.2);
    const hourlyProfit = commafy(3600 / time * totalProfit);
    const dailyProfit = commafy(86400 / time * totalProfit);

    ChatLib.chat(`\n${DARK_GREEN}${BOLD}Average Profit for Composter`);
    ChatLib.chat(`${AQUA}Organic Matter Cost [${WHITE}Box Of Seeds${AQUA}]: ${RED}${commafy(organicCost)}`);
    ChatLib.chat(`${AQUA}Fuel Cost [${WHITE}${fuelType}${AQUA}]: ${RED}${commafy(fuelCost)}`);
    ChatLib.chat(`${AQUA}Average Compost Profit: ${GREEN}${commafy(compostPrice)}`);
    ChatLib.chat(`${AQUA}Overall Profit: ${totalProfit > 0 ? GREEN : RED}${commafy(totalProfit)}\n`);
    ChatLib.chat(`${AQUA}Hourly Profit: ${hourlyProfit > 0 ? GREEN : RED}${hourlyProfit}`);
    ChatLib.chat(`${AQUA}Daily Profit: ${dailyProfit > 0 ? GREEN : RED}${dailyProfit}\n`);
}
