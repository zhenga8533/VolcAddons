import { romanToNum } from "../../utils/functions";
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
