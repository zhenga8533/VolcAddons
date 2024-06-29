import { AQUA, BOLD, DARK_GRAY, DARK_GREEN, GREEN, LOGO, RED, WHITE } from "../../utils/Constants";
import { data } from "../../utils/Data";
import location from "../../utils/Location";
import { Overlay } from "../../utils/Overlay";
import { registerWhen } from "../../utils/RegisterTils";
import Settings from "../../utils/Settings";
import { setTitle } from "../../utils/Title";
import { commafy, formatTime, romanToNum } from "../../utils/functions/format";
import { getBazaar } from "../economy/Economy";

/**
 * Composter timers
 */
const compostExample = `${DARK_GREEN + BOLD}Composter:
 ${GREEN}Empty: ${WHITE}Loading
 ${GREEN}Next: ${WHITE}...`;
const compostOverlay = new Overlay("compostTab", data.OL, "moveCompost", compostExample, ["Garden"]);
let emptyCompost = 0;

/**
 * Tracks time until compost empty
 */
function updateCompost() {
  const container = Player.getContainer();
  if (container.getName() !== "Composter") return;
  const cropMeter = container.getStackInSlot(46)?.getLore();
  const fuelMeter = container.getStackInSlot(52)?.getLore();
  if (cropMeter === undefined || fuelMeter === undefined) return;

  // Composter Upgrades
  const costUpgrade = data.composterUpgrades["Cost Reduction"];
  const speed = 600 / (1 + data.composterUpgrades["Composter Speed"] * 0.2);

  // Run out calc
  const crop = Object.entries(cropMeter)[1][1].removeFormatting().replace(/[\s,]/g, "").replace("/", " ").split(" ")[0];
  const fuel = Object.entries(fuelMeter)[1][1].removeFormatting().replace(/[\s,]/g, "").replace("/", " ").split(" ")[0];
  const noCrop = (crop / (4000 * (1 - costUpgrade / 100))) * speed;
  const noFuel = (fuel / (2000 * (1 - costUpgrade / 100))) * speed;
  emptyCompost = Math.min(noCrop, noFuel);
}
registerWhen(
  register("guiOpened", () => {
    Client.scheduleTask(1, updateCompost);
  }),
  () => location.getWorld() === "Garden" && Settings.compostTab === 2
);
registerWhen(
  register("guiMouseClick", () => {
    Client.scheduleTask(1, updateCompost);
  }),
  () => location.getWorld() === "Garden" && Settings.compostTab === 2
);

/**
 * Update compost overlay.
 */
registerWhen(
  register("step", () => {
    if (!World.isLoaded()) return;
    const tablist = TabList.getNames();

    if (Settings.gardenTab === 1) {
      if (tablist.find((tab) => tab.includes("Time Left")) !== undefined)
        setTitle(`${DARK_RED + BOLD} ${WHITE}COMPOSTER INACTIVE!`, "", 0, 25, 5, 3);
      return;
    }

    if (emptyCompost <= 0) {
      // Composter Upgrades
      const costUpgrade = data.composterUpgrades["Cost Reduction"];
      const speed = 600 / (1 + data.composterUpgrades["Composter Speed"] * 0.2);

      // Run out calc
      const organic = tablist.find((tab) => tab.includes("Organic Matter"))?.removeFormatting() ?? "0";
      const crop = organic.replace(/\D/g, "") * (organic.includes("k") ? 1000 : 1);
      const fuel =
        (tablist
          .find((tab) => tab.includes("Fuel"))
          ?.removeFormatting()
          ?.replace(/\D/g, "") ?? 0) * 1000;
      const noCrop = (crop / (4000 * (1 - costUpgrade / 100))) * speed;
      const noFuel = (fuel / (2000 * (1 - costUpgrade / 100))) * speed;

      emptyCompost = Math.min(noCrop, noFuel);
    }

    emptyCompost--;
    const message = emptyCompost <= 100 ? `${RED}Inactive` : `${WHITE + formatTime(emptyCompost)}`;
    const time =
      tablist
        .find((tab) => tab.includes("Time Left"))
        ?.removeFormatting()
        ?.match(/(\d+)m (\d+)s|(\d+)s/) ?? 0;
    const nextCompost = !time
      ? `${RED}Inactive`
      : formatTime(
          (time[1] ? parseInt(time[1], 10) : 0) * 60 + (time[2] ? parseInt(time[2], 10) : parseInt(time[3], 10))
        );
    compostOverlay.setMessage(
      `${DARK_GREEN + BOLD}Composter:
 ${GREEN}Empty: ${message}
 ${GREEN}Next: ${WHITE + nextCompost}`
    );
  }).setFps(1),
  () => location.getWorld() === "Garden" && Settings.gardenTab
);

/**
 * Tracks whenever player is in the Composter Upgrades gui and saves their upgrade values.
 */
registerWhen(
  register("guiOpened", () => {
    Client.scheduleTask(1, () => {
      // Get compsoter upgrades container
      let container = Player.getContainer();
      if (container.getName() !== "Composter Upgrades") return;

      // Get composter levels
      // Composter Speed => Sugar ID: 353
      // Multi Drop => Diamond Hoe ID: 293
      // Cost Reduction => Gold Ingot ID: 266
      const items = container.getItems();
      data.composterUpgrades["Composter Speed"] = romanToNum(
        items[container.indexOf(353)].getName().removeFormatting().split(" ").pop()
      );
      data.composterUpgrades["Multi Drop"] = romanToNum(
        items[container.indexOf(293)].getName().removeFormatting().split(" ").pop()
      );
      data.composterUpgrades["Cost Reduction"] = romanToNum(
        items[container.indexOf(266)].getName().removeFormatting().split(" ").pop()
      );
    });
  }),
  () => location.getWorld() === "Garden"
);

/**
 * Calculates composting profit and cost considering composter upgrades and bazaar prices.
 *
 * @param {String[]} args - Array of composter upgrade levels.
 */
export function calcCompost(args) {
  const bazaar = getBazaar();

  // Upgrades
  const testLevel = parseInt(args[2]);
  if (isNaN(testLevel) && data.composterUpgrades["Cost Reduction"] === -1) {
    ChatLib.chat(`${LOGO + RED}Please input as: ${WHITE}/va calc compost [level]!`);
    ChatLib.chat(
      `${LOGO + DARK_GRAY}Please note that this means your composter upgrade menu has not yet been tracked!`
    );
    return;
  }
  const speedUpgrade = !isNaN(testLevel) ? testLevel : data.composterUpgrades["Composter Speed"];
  const multiUpgrade = !isNaN(testLevel) ? testLevel : data.composterUpgrades["Multi Drop"];
  const costUpgrade = !isNaN(testLevel) ? testLevel : data.composterUpgrades["Cost Reduction"];

  // Organic (4k) / Fuel (2k) Cost
  // Box of Seeds give 25.6k organic
  // Oil Barrel gives 10k fuel
  const organicCost = bazaar["BOX_OF_SEEDS"][0] / (25600 / (4000 * (1 - costUpgrade / 100)));
  const fuelType = bazaar["OIL_BARREL"][0] > bazaar["VOLTA"][0] ? "Volta" : "Oil Barrel";
  const fuelCost = Math.min(bazaar["OIL_BARREL"][0], bazaar["VOLTA"][0]) / (10000 / (2000 * (1 - costUpgrade / 100)));
  const totalCost = Math.round(organicCost + fuelCost);

  // Profit
  const compostPrice = Math.round(bazaar["COMPOST"][1] * (1 + multiUpgrade * 0.03)); // Multi Drop => +0.03% per level
  const totalProfit = compostPrice - totalCost;

  // Daily Profit
  const time = 600 / (1 + speedUpgrade * 0.2);
  const hourlyProfit = commafy((3600 / time) * totalProfit);
  const dailyProfit = commafy((86400 / time) * totalProfit);

  ChatLib.chat(
    `\n${DARK_GREEN + BOLD}Composter Calculation:
${AQUA}Organic Matter Cost [${WHITE}Box Of Seeds${AQUA}]: ${RED + commafy(organicCost)}
${AQUA}Fuel Cost [${WHITE + fuelType + AQUA}]: ${RED + commafy(fuelCost)}
${AQUA}Compost Profit: ${GREEN + commafy(compostPrice)}
${AQUA}Overall Profit: ${(totalProfit > 0 ? GREEN : RED) + commafy(totalProfit)}\n
${AQUA}Hourly Profit: ${(hourlyProfit > 0 ? GREEN : RED) + hourlyProfit}
${AQUA}Daily Profit: ${(dailyProfit > 0 ? GREEN : RED) + dailyProfit}\n`
  );
}
