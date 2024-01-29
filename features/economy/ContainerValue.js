import settings from "../../utils/settings";
import { AQUA, BLUE, GRAY, DARK_PURPLE, DARK_RED, GOLD, GREEN, LIGHT_PURPLE, RED, WHITE, ITALIC, DARK_AQUA } from "../../utils/constants";
import { formatNumber } from "../../utils/functions/format";
import { Overlay } from "../../utils/overlay";
import { data, registerWhen } from "../../utils/variables";
import { getBazaar } from "./Economy";
import { getItemValue } from "./ItemPrice";


/**
 * Variables used to track and display container value.
 */
const VALID_CONTAINERS = new Set(["Chest", "Backpack", "Bag", "Wardrobe", "Pets", "Vault", "Museum"]);
const containerExample = 
`${WHITE}Item 1${GRAY} - ${WHITE}Be
${GREEN}Item 2${GRAY} - ${WHITE}Extremely
${BLUE}Item 3${GRAY} - ${WHITE}Subtle
${DARK_PURPLE}Item 4${GRAY} - ${WHITE}Even
${GOLD}Item 5${GRAY} - ${WHITE}To
${LIGHT_PURPLE}Item 6${GRAY} - ${WHITE}The
${AQUA}Item 7${GRAY} - ${WHITE}Point
${RED}Item 8${GRAY} - ${WHITE}Of
${RED}Item 9${GRAY} - ${WHITE}Formlessness
${DARK_RED}-Sun Tzu, The Art of War`;
const containerOverlay = new Overlay("containerValue", ["all", "misc"],
() => true, data.RL, "moveContainer", containerExample);
containerOverlay.message = "";

/**
 * Set the message of the overlay given the items object and value.
 * 
 * @param {Object} itemValues - itemName: [count, value]
 * @param {Number} totalValue - Total value of container
 * @returns 
 */
function setMessage(itemValues, totalValue) {
    if (totalValue === 0) {
        containerOverlay.message = "";
        return;
    }

    // Convert itemValues object to an array of [itemName, [count, value]]
    const sortedItems = Object.entries(itemValues).sort((a, b) => b[1][1] - a[1][1]);
            
    // Display the sorted items and total value
    let overlayMessage = `${DARK_AQUA}Total Value: ${AQUA + formatNumber(totalValue)}\n\n`;
    let displayedItems = 0;

    // Destructuring here for cleaner loop
    for ([itemName, [itemCount, itemValue]] of sortedItems) {
        overlayMessage += `${itemName} ${GRAY}x${formatNumber(itemCount)} ${WHITE}= ${GREEN + formatNumber(itemValue)}\n`;
        displayedItems++;
        if (displayedItems >= settings.containerValue) {
            const remainingItems = sortedItems.length - settings.containerValue;
            if (remainingItems > 0) {
                overlayMessage += `${GRAY + ITALIC}+ ${remainingItems} more items...\n`;
            }
            break;
        }
    }

    containerOverlay.message = overlayMessage;
}

/**
 * Caclulate the value of a sack container (different stack size)
 * 
 * @param {Inventory} container - players currently opened container
 */
function sackValue(container) {
    const bazaar = getBazaar();
    const itemValues = {};
    let totalValue = 0;

    for (let i = 0; i < 45; i++) {
        // Get item stack or detect no item
        let stack = container.getStackInSlot(i);
        let stackName = stack.getName();
        if (stackName === "§aGo Back") break;
        if (stack.getName() === " ") continue;

        // Get value and count from item stack
        let id = stack.getNBT().getCompoundTag("tag").getCompoundTag("ExtraAttributes").getString("id");
        let value = bazaar?.[id]?.[settings.priceType] ?? 0;
        let count = stack.getLore().find(line => line.startsWith("§5§o§7Stored:"))
            ?.removeFormatting()
            ?.match(/Stored: (\d+(?:,\d{3})*(?:\.\d+)?)/)
            ?.[1]?.replace(/,/g, '');
        if (count === undefined || count == 0 || value == 0) continue;

        // Add value into container value message
        let stackValue = value * count;
        itemValues[stackName] = [count, stackValue];
        totalValue += stackValue;
    }

    setMessage(itemValues, totalValue);
}

/**
 * Calculates and displays the total value of items in the player's container.
 * Generates a formatted overlay message for the containerOverlay.
 */
function updateContainerValue(remove) {
    Client.scheduleTask(3, () => {
        const container = Player.getContainer();
        const containerName = container.getName().removeFormatting();
        const words = containerName.split(" ");
        if (containerName.endsWith("Sack")) {
            sackValue(container);
            return;
        } else if (!VALID_CONTAINERS.has(words[0]) && !VALID_CONTAINERS.has(words[1]) && remove !== 0) return;

        const items = container.getItems();
        const itemValues = {};
        let totalValue = 0;
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
                totalValue += value;
            }
        }

        setMessage(itemValues, totalValue);
    });
}

/**
 * Handles GUI events in container GUIs, updating value overlay display if a chest GUI is involved.
 */
registerWhen(register("guiOpened", (event) => {
    const guiName = event.gui.class.getName();
    if (guiName === "net.minecraft.client.gui.inventory.GuiInventory") updateContainerValue(0);
    else if (guiName === "net.minecraft.client.gui.inventory.GuiChest") updateContainerValue(36);
}), () => settings.containerValue !== 0);

/**
 * Handles mouse click interactions within container GUIs.
 * Invokes `updateContainerValue` to update value overlay display.
 */
registerWhen(register("guiMouseRelease", (x, y, button, gui) => {
    const guiName = gui.class.getName();
    if (guiName === "net.minecraft.client.gui.inventory.GuiInventory") updateContainerValue(0);
    else if (guiName === "net.minecraft.client.gui.inventory.GuiChest") updateContainerValue(36);
}), () => settings.containerValue !== 0);

/**
 * This function clears the content of the container overlay message, effectively removing it from display.
 */
registerWhen(register("guiClosed", () => {
    containerOverlay.message = "";
}), () => settings.containerValue !== 0);
