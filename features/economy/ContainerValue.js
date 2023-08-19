import settings from "../../settings";
import { AQUA, BLUE, GRAY, DARK_PURPLE, DARK_RED, GOLD, GREEN, LIGHT_PURPLE, RED, WHITE, ITALIC, DARK_AQUA } from "../../utils/constants";
import { formatNumber } from "../../utils/functions";
import { Overlay } from "../../utils/overlay";
import { data, registerWhen } from "../../utils/variables";
import { getItemValue } from "./ItemPrice";


/**
 * Variables used to track and display container value.
 */
const VALID_CONTAINERS = new Set(["Chest", "Backpack"]);
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
 * Extracts the second word from a string if present, otherwise returns the first word.
 * 
 * @param {string} inputString - The input string to process.
 * @returns {string} The second word or the first word if no second word is present.
 */
function getFirstSecondWord(inputString) {
    if (inputString === undefined) return undefined;
    let firstSpaceIndex = inputString.indexOf(' ');
  
    if (firstSpaceIndex !== -1) {
        let secondSpaceIndex = inputString.indexOf(' ', firstSpaceIndex + 1);
        return secondSpaceIndex !== -1 ?
            inputString.substring(firstSpaceIndex + 1, secondSpaceIndex) :
            inputString.substring(firstSpaceIndex + 1);
    }
  
    return inputString;
}

/**
 * Calculates and displays the total value of items in the player's container.
 * Generates a formatted overlay message for the containerOverlay.
 */
function updateContainerValue(remove) {
    Client.scheduleTask(3, () => {
        const container = Player.getContainer();
        const containerName = container.getName().removeFormatting();
        if (!VALID_CONTAINERS.has(getFirstSecondWord(containerName)) && remove !== 0) return;

        const items = container.getItems();
        const itemValues = {};
        let totalValue = 0;
        for (let i = 0; i < items.length - remove; i++) {
            let item = items[i];
            if (item === null) continue;

            let itemName = item.getName();
            let value = getItemValue(item);

            if (value !== 0) {
                let itemCount = item.getStackSize();

                // Destructuring here for cleaner loop
                let [existingItemCount = 0, existingItemValue = 0] = itemValues[itemName] || [];
                itemValues[itemName] = [existingItemCount + itemCount, existingItemValue + value];
                totalValue += value;
            }
        }

        if (totalValue === 0) {
            containerOverlay.message = "";
            return;
        }

        // Convert itemValues object to an array of [itemName, [count, value]]
        const sortedItems = Object.entries(itemValues).sort((a, b) => b[1][1] - a[1][1]);
        
        // Display the sorted items and total value
        let overlayMessage = `${DARK_AQUA}Total Value: ${AQUA}${formatNumber(totalValue)}\n\n`;
        let displayedItems = 0;
        
        // Destructuring here for cleaner loop
        for ([itemName, [itemCount, itemValue]] of sortedItems) {
            overlayMessage += `${itemName} ${GRAY}x${itemCount} ${WHITE}= ${GREEN}${formatNumber(itemValue)}\n`;
            displayedItems++;
            if (displayedItems >= settings.containerValue) {
                const remainingItems = sortedItems.length - settings.containerValue;
                if (remainingItems > 0) {
                    overlayMessage += `${GRAY}${ITALIC}+ ${remainingItems} more items...\n`;
                }
                break;
            }
        }

        containerOverlay.message = overlayMessage;
    });
}

/**
 * Handles GUI events in container GUIs, updating value overlay display if a chest GUI is involved.
 *
 * @param {object} event - The GUI event object.
 */
registerWhen(register("guiOpened", (event) => {
    const guiName = event.gui.class.getName();
    if (guiName === "net.minecraft.client.gui.inventory.GuiInventory") updateContainerValue(0);
    else if (guiName === "net.minecraft.client.gui.inventory.GuiChest") updateContainerValue(36);
}), () => settings.containerValue);

/**
 * Handles mouse click interactions within container GUIs.
 * Invokes `updateContainerValue` to update value overlay display.
 *
 * @param {number} x - X-coordinate of mouse click.
 * @param {number} y - Y-coordinate of mouse click.
 * @param {number} button - Pressed mouse button.
 * @param {object} gui - Associated GUI object.
 */
registerWhen(register("guiMouseRelease", (x, y, button, gui) => {
    const guiName = gui.class.getName();
    if (guiName === "net.minecraft.client.gui.inventory.GuiInventory") updateContainerValue(0);
    else if (guiName === "net.minecraft.client.gui.inventory.GuiChest") updateContainerValue(36);
}), () => settings.containerValue);

/**
 * This function clears the content of the container overlay message, effectively removing it from display.
 */
registerWhen(register("guiClosed", () => {
    containerOverlay.message = "";
}), () => settings.containerValue);
