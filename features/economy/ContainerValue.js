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
 * This function retrieves item information from the player's container, calculates the total value
 * of items inside the container, and generates a formatted overlay message to display the item values.
 * The message is based on settings and is shown in the containerOverlay.
 */
function updateContainerValue() {
    Client.scheduleTask(3, () => {
        const container = Player.getContainer();
        const containerName = container.getName().removeFormatting();
        if (!VALID_CONTAINERS.has(getFirstSecondWord(containerName))) return;

        const items = container.getItems();
        const itemValues = {};
        let totalValue = 0;
        for (let i = 0; i < items.length - 36; i++) {
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
 * This event handler is triggered when a GUI event occurs, specifically for container GUIs.
 * It checks if the event is associated with a chest GUI (inventory GUI), and if so, it invokes
 * the `updateContainerValue` function to update the value overlay display for the container.
 *
 * @param {object} event - The event object representing the GUI event.
 */
registerWhen(register("guiOpened", (event) => {
    if (event.gui.class.getName() !== "net.minecraft.client.gui.inventory.GuiChest") return;
    updateContainerValue();
}), () => settings.containerValue);

/**
 * This event handler is triggered when a mouse click interaction occurs in a GUI.
 * It specifically targets interactions within a container GUI (chest GUI) and invokes
 * the `updateContainerValue` function to update the value overlay display for the container.
 *
 * @param {number} x - The x-coordinate of the mouse click.
 * @param {number} y - The y-coordinate of the mouse click.
 * @param {number} button - The mouse button pressed during the interaction.
 * @param {object} gui - The GUI object associated with the interaction.
 */
registerWhen(register("guiMouseRelease", (x, y, button, gui) => {
    if (gui.class.getName() !== "net.minecraft.client.gui.inventory.GuiChest") return;
    updateContainerValue();
}), () => settings.containerValue);

/**
 * This function clears the content of the container overlay message, effectively removing it from display.
 */
registerWhen(register("guiClosed", () => {
    containerOverlay.message = "";
}), () => settings.containerValue);
