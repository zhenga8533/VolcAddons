import { GREEN, RED, YELLOW } from "../../utils/Constants";
import { data } from "../../utils/Data";
import { Overlay } from "../../utils/Overlay";
import Settings from "../../utils/Settings";
import { formatNumber, unformatNumber } from "../../utils/functions/format";
import { getBazaar } from "../economy/Economy";
import { getItemValue } from "../economy/ItemPrice";

const profitExample = `§eProfit: §c-123.77k

§9Enchanted Book: §a0
§fEnchanted Book: §a0
§dWither Essence §8x9: §a26.82k
§dUndead Essence §8x10: §a5.99k
§eCost: §c156.59k`;
const profitOverlay = new Overlay(
  "dungeonProfit",
  data.DL,
  "moveDP",
  profitExample,
  ["Catacombs", "Dungeon Hub"],
  "guiRender"
);

const close = register("guiClosed", () => {
  profitOverlay.setMessage("");
  close.unregister();
}).unregister();

/**
 * Sets the profit overlay message for the chest.
 */
function setChest() {
  const items = Player.getContainer().getItems();
  const bazaar = getBazaar();

  // Get the cost of the chest
  const costLore = items[31].getLore();
  let costIndex = costLore.findIndex((line) => line.endsWith(" Coins"));
  let cost = unformatNumber(costLore[costIndex]?.split(" ")?.[0]?.removeFormatting());
  cost += costLore[costIndex + 1] !== "§5§o§9Dungeon Chest Key" ? 0 : bazaar["DUNGEON_CHEST_KEY"]?.[Settings.priceType];

  let profit = -cost;
  let message = "";

  // Iterate through the items in the chest
  for (let i = 0; i < 9; i++) {
    // Get the item and its value
    let item = items[9 + i];
    let unlocalName = item.getUnlocalizedName();
    if (unlocalName === "tile.thinStainedGlass") continue;

    // Calculate the value of the item
    let value = getItemValue(item, false);
    if (unlocalName !== "item.enchantedBook" && value === 0) {
      let split = item.getName().removeFormatting().split(" ");
      let amount = parseInt(split.pop().substring(1));
      let id = (split[1] + "_" + split[0]).toUpperCase();
      value = (bazaar[id]?.[Settings.priceType] ?? 0) * amount;
    }

    profit += value;
    message += `\n${item.getName()}: ${GREEN + formatNumber(value)}`;
  }

  // Set the profit overlay message
  let profitColor = profit < 0 ? RED : GREEN;
  message = `${YELLOW}Profit: ${profitColor + formatNumber(profit)}\n${message}\n${YELLOW}Cost: ${
    RED + formatNumber(cost)
  }`;
  profitOverlay.setMessage(message);
}

/**
 * TBD at a later date if I feel like it :).
 */
function setCroesus() {
  const bazaar = getBazaar();
  const items = Player.getContainer().getItems();

  for (let i = 0; i < 9; i++) {
    let chest = items[9 + i];
    if (chest.getUnlocalizedName() === "tile.thinStainedGlass") continue;
  }
}

register("guiOpened", () => {
  Client.scheduleTask(1, () => {
    if (Player.getContainer().getItems()[31]?.getName() !== "§aOpen Reward Chest") return;

    setChest();
    close.register();
  });
});
