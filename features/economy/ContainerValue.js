import {
  AQUA,
  BLUE,
  DARK_PURPLE,
  DARK_RED,
  GOLD,
  GRAY,
  GREEN,
  ITALIC,
  LIGHT_PURPLE,
  RED,
  WHITE,
  YELLOW,
} from "../../utils/Constants";
import { data } from "../../utils/Data";
import { Overlay } from "../../utils/Overlay";
import { registerWhen } from "../../utils/RegisterTils";
import Settings from "../../utils/Settings";
import { formatNumber, unformatNumber } from "../../utils/functions/format";
import { getBazaar } from "./Economy";
import { getItemValue } from "./ItemPrice";

/**
 * Variables used to track and display container value.
 */
const VALID_CONTAINERS = new Set(["Chest", "Backpack", "Bag", "Wardrobe", "Pets", "Vault", "Museum"]);
const containerExample = `${WHITE}Item 1${GRAY} - ${WHITE}Be
${GREEN}Item 2${GRAY} - ${WHITE}Extremely
${BLUE}Item 3${GRAY} - ${WHITE}Subtle
${DARK_PURPLE}Item 4${GRAY} - ${WHITE}Even
${GOLD}Item 5${GRAY} - ${WHITE}To
${LIGHT_PURPLE}Item 6${GRAY} - ${WHITE}The
${AQUA}Item 7${GRAY} - ${WHITE}Point
${RED}Item 8${GRAY} - ${WHITE}Of
${RED}Item 9${GRAY} - ${WHITE}Formlessness
${DARK_RED}-Sun Tzu, The Art of War`;
const containerOverlay = new Overlay(
  "containerValue",
  data.RL,
  "moveContainer",
  containerExample,
  ["all"],
  "guiRender"
);
containerOverlay.setMessage("");

/**
 * Set the message of the overlay given the items object and value.
 *
 * @param {Object} itemValues - itemName: [count, value]
 * @returns
 */
function setMessage(itemValues) {
  // Convert itemValues object to an array of [itemName, [count, value]]
  const sortedItems = Object.entries(itemValues).sort((a, b) => b[1][1] - a[1][1]);

  // Display the sorted items and total value
  let overlayMessage = "";
  let displayedItems = 0;
  let totalValue = 0;

  // Destructuring here for cleaner loop
  for ([itemName, [itemCount, itemValue]] of sortedItems) {
    totalValue += itemValue;
    displayedItems++;

    // Display only the top containerValue items
    if (displayedItems === Settings.containerValue) {
      const remainingItems = sortedItems.length - Settings.containerValue;
      if (remainingItems > 0) {
        overlayMessage += `\n${GRAY + ITALIC}+ ${remainingItems} more items...`;
      }
    } else if (displayedItems < Settings.containerValue) {
      overlayMessage += `\n${itemName} ${GRAY}x${formatNumber(itemCount)} ${WHITE}= ${GREEN + formatNumber(itemValue)}`;
    }
  }

  if (totalValue === 0) containerOverlay.setMessage("");
  else containerOverlay.setMessage(`${GOLD}Total Value: ${YELLOW + formatNumber(totalValue)}\n` + overlayMessage);
}

/**
 * Caclulate the value of a sack container (different stack size)
 *
 * @param {Inventory} container - Player GUI container.
 */
function sackValue(container) {
  const bazaar = getBazaar();
  const itemValues = {};

  for (let i = 0; i < 45; i++) {
    // Get item stack or detect no item
    let stack = container.getStackInSlot(i);
    let stackName = stack.getName();
    if (stackName === "§aGo Back") break;
    if (stack.getName() === " ") continue;

    // Get value and count from item stack
    let id = stack.getNBT().getCompoundTag("tag").getCompoundTag("ExtraAttributes").getString("id");
    let value = bazaar?.[id]?.[Settings.priceType] ?? 0;
    let count = stack
      .getLore()
      .find((line) => line.startsWith("§5§o§7Stored:"))
      ?.removeFormatting()
      ?.match(/Stored: (\d+(?:,\d{3})*(?:\.\d+)?)/)?.[1]
      ?.replace(/,/g, "");
    if (count === undefined || count == 0 || value == 0) continue;

    // Add value into container value message
    let stackValue = value * count;
    itemValues[stackName] = [count, stackValue];
  }

  setMessage(itemValues);
}

/**
 * Calculate the value of a composter container.
 *
 * @param {Inventory} container - Player GUI container.
 */
function composterValue(container) {
  // Get composting values
  const bazaar = getBazaar();
  const compost = container.getStackInSlot(13);
  const available = parseInt(
    compost
      .getLore()
      .find((line) => line.startsWith("§5§o§7§7Compost Available:"))
      .split(" ")[2]
      .removeFormatting()
  );

  // Get composter upgrades
  const crop = unformatNumber(container.getStackInSlot(1).getLore()[1].removeFormatting().trim().split("/")[0]);
  const fuel = unformatNumber(container.getStackInSlot(7).getLore()[1].removeFormatting().trim().split("/")[0]);
  const costUpgrade = data.composterUpgrades["Cost Reduction"];
  const noCrop = crop / (4000 * (1 - costUpgrade / 100));
  const noFuel = fuel / (2000 * (1 - costUpgrade / 100));
  const composting = Math.min(noCrop, noFuel) * (1 + 0.03 * data.composterUpgrades["Multi Drop"]);
  const value = bazaar?.["COMPOST"]?.[Settings.priceType] ?? 0;

  // Set composting values
  const itemValues = {
    Composted: [available, available * value],
    Composting: [composting, composting * value],
  };
  setMessage(itemValues, value);
}

/**
 * Calculate the value of a bazaar container.
 *
 * @param {Inventory} container - Player GUI container.
 */
function bazaarValue(container) {
  const itemValues = {};

  for (let i = 1; i < 5; i++) {
    const firstStack = container.getStackInSlot(i * 9 + 1);
    if (firstStack !== null && firstStack.getUnlocalizedName() === "tile.thinStainedGlass") break;

    for (let j = 1; j < 9; j++) {
      // Get item stack or detect no item
      let stack = container.getStackInSlot(i * 9 + j);
      if (stack === null) break;
      const lore = stack.getLore();

      // Get item name, capacity, and price
      const name = stack.getName().split(" ").slice(1).join(" ");
      let amount = 0;
      let price = 0;

      // Get capacity and price from lore
      const amountLine = lore.find((line) => line.includes("amount:"));
      if (amountLine) {
        const regex = /(Offer|Order) amount: ([0-9,]+)x/;
        const match = amountLine.removeFormatting().match(regex);
        if (match) amount = unformatNumber(match[2]);
      }

      // Get price from lore
      const priceLine = lore.find((line) => line.startsWith("§5§o§7Price per unit:"));
      if (priceLine) {
        const match = priceLine.removeFormatting().split(" ")[3];
        price = unformatNumber(match);
      }

      itemValues[name] = [amount, amount * price];
    }
  }

  setMessage(itemValues);
}

/**
 * Calculate the value of an auction container.
 *
 * @param {Inventory} container - Player GUI container.
 */
function auctionValue(container) {
  const itemValues = {};

  for (let i = 1; i < 5; i++) {
    const firstStack = container.getStackInSlot(i * 9 + 1);
    if (firstStack !== null && firstStack.getUnlocalizedName() === "tile.thinStainedGlass") break;

    for (let j = 1; j < 9; j++) {
      // Get item stack or detect no item
      let stack = container.getStackInSlot(i * 9 + j);
      if (stack === null) break;
      const lore = stack.getLore();

      // Get item name, capacity, and price
      const name = stack.getName();
      let value =
        unformatNumber(
          lore
            .find((line) => line.startsWith("§5§o§7Buy it now:"))
            ?.split(" ")?.[3]
            ?.removeFormatting()
        ) ||
        unformatNumber(
          lore
            .find((line) => line.startsWith("§5§o§7Sold for:"))
            ?.split(" ")?.[2]
            ?.removeFormatting()
        );
      unformatNumber(
        lore
          .find((line) => line.startsWith("§5§o§7Top bid:"))
          ?.split(" ")?.[2]
          ?.removeFormatting()
      );
      itemValues[name] = [1, value];
    }
  }

  setMessage(itemValues);
}

/**
 * Calculates and displays the total value of items in the player's container.
 * Generates a formatted overlay message for the containerOverlay.
 */
function updateContainerValue(remove) {
  Client.scheduleTask(3, () => {
    // Check if container is valid
    const container = Player.getContainer();
    const containerName = container.getName().removeFormatting();
    const items = container.getItems();
    const words = containerName.split(" ");
    if (containerName.endsWith("Sack")) {
      sackValue(container);
      return;
    } else if (containerName === "Composter") {
      composterValue(container);
      return;
    } else if (containerName.endsWith("Bazaar Orders")) {
      bazaarValue(container);
      return;
    } else if (containerName === "Manage Auctions") {
      auctionValue(container);
      return;
    } else if (
      (!VALID_CONTAINERS.has(words[0]) && !VALID_CONTAINERS.has(words[1]) && remove !== 0) ||
      items[31]?.getName() === "§aOpen Reward Chest"
    )
      return;

    const itemValues = {};
    for (let i = 0; i < items.length - remove; i++) {
      let item = items[i];
      if (item === null) continue;

      // Change name if attribute shard or enchanted book
      let itemName = item.getName();
      if (itemName === "§fAttribute Shard" || itemName === "§fEnchanted Book")
        itemName = item.getNBT().getCompoundTag("tag").getCompoundTag("display").toObject().Lore[0];

      // Get item value + item count
      let value = getItemValue(item, false);
      if (value !== 0) {
        let itemCount = item.getStackSize();

        // Destructuring here for cleaner loop
        let [existingItemCount = 0, existingItemValue = 0] = itemValues[itemName] || [];
        itemValues[itemName] = [existingItemCount + itemCount, existingItemValue + value];
      }
    }

    setMessage(itemValues);
  });
}

/**
 * Handles mouse click interactions within container GUIs.
 * Invokes `updateContainerValue` to update value overlay display.
 */
const mouse = register("guiMouseRelease", (_, __, ___, gui) => {
  const guiName = gui.class.getName();
  if (guiName === "net.minecraft.client.gui.inventory.GuiInventory") updateContainerValue(0);
  else if (guiName === "net.minecraft.client.gui.inventory.GuiChest") updateContainerValue(36);
}).unregister();

/**
 * This function clears the content of the container overlay message, effectively removing it from display.
 */
const close = register("guiClosed", () => {
  mouse.unregister();
  close.unregister();
}).unregister();

/**
 * Handles GUI events in container GUIs, updating value overlay display if a chest GUI is involved.
 */
registerWhen(
  register("guiOpened", (event) => {
    containerOverlay.setMessage("");
    const guiName = event.gui.class.getName();
    if (guiName === "net.minecraft.client.gui.inventory.GuiInventory") updateContainerValue(0);
    else if (guiName === "net.minecraft.client.gui.inventory.GuiChest") updateContainerValue(36);
    else return;

    mouse.register();
    close.register();
  }),
  () => Settings.containerValue !== 0
);
