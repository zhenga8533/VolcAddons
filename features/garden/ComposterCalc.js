import { getBazaar, getPricing } from "../../utils/bazaar";
import { AQUA, BOLD, DARK_GREEN, GREEN, LOGO, RED } from "../../utils/constants";
import { commafy, romanToNum } from "../../utils/functions";
import { data, registerWhen } from "../../utils/variables";
import { getWorld } from "../../utils/worlds";

// Composter Shit
registerWhen(register("step", () => {
    // Get compsoter upgrades container
    if (!Client.isInGui()) return;
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
}).setFps(1), () => data.composterUpgrades["Composter Speed"] == -1 && getWorld() == "Garden");

// Upgrades from chat
registerWhen(register("chat", (upgrade, previous, current) => {
    data.composterUpgrades[upgrade] = romanToNum(current);
}).setCriteria("COMPOSTER UPGRADED ${upgrade} ${previous}➜${current}"), () => getWorld() == "Garden");


// Actual Calculator
export function calcCompost(args) {
    getPricing();
    const items = getBazaar();

    // Upgrades
    const testLevel = parseInt(args[2]);
    if (isNaN(testLevel) && data.composterUpgrades["Cost Reduction"] == -1)
        ChatLib.chat(`${LOGO} ${RED}Please input as /va calc compost [level] / open you composter upgrades menu!`);
    const speedUpgrade = !isNaN(testLevel) ? testLevel : data.composterUpgrades["Composter Speed"];
    const multiUpgrade = !isNaN(testLevel) ? testLevel : data.composterUpgrades["Multi Drop"];
    const costUpgrade = !isNaN(testLevel) ? testLevel : data.composterUpgrades["Cost Reduction"];

    // Organic (4k) / Fuel (2k) Cost
    // Box of Seeds give 25.6k organic
    // Oil Barrel gives 10k fuel
    const organicCost = items["BOX_OF_SEEDS"][0] / (25600 / (4000 * (1 - costUpgrade/100)));
    const fuelCost = items["OIL_BARREL"][0] / (10000 / (2000 * (1 - costUpgrade/100)));
    const totalCost = Math.round(organicCost + fuelCost);

    // Profit
    const compostPrice = Math.round(items["COMPOST"][1] * (1 + multiUpgrade * 0.03)); // Multi Drop => +0.03% per level
    const totalProfit = compostPrice - totalCost;

    // Daily Profit
    const time = 600 / (1 + speedUpgrade * 0.2);
    const hourlyProfit = commafy(3600 / time * totalProfit);
    const dailyProfit = commafy(86400 / time * totalProfit);

    ChatLib.chat(`\n${DARK_GREEN}${BOLD}Average Profit for Composter`);
    ChatLib.chat(`${AQUA}Profit per Compost: ${GREEN}${commafy(totalProfit)}`);
    ChatLib.chat(`${AQUA}Hourly Profit: ${GREEN}${hourlyProfit}`);
    ChatLib.chat(`${AQUA}Daily Profit: ${GREEN}${dailyProfit}\n`);
}
