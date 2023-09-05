import settings from "../../utils/settings";
import { GREEN } from "../../utils/constants";
import { data, registerWhen } from "../../utils/variables";


/**
 * Callback for handling mouse button clicks and releases to track ability usage.
 * @param {number} x - The x-coordinate of the mouse pointer.
 * @param {number} y - The y-coordinate of the mouse pointer.
 * @param {number} button - The index of the clicked mouse button (0 for left, 1 for right, 2 for middle).
 * @param {boolean} down - Indicates whether the button was pressed (true) or released (false).
 */
let items = {};
registerWhen(register("clicked", (x, y, button, down) => {
    const held = Player.getHeldItem();
    if (Client.isInGui() || down === false || button === 0 || held === null) return;
    const heldName = held.getName();
    if (!(heldName in data.cooldownlist)) return;
    const cd = data.cooldownlist[heldName];
    if (isNaN(cd)) {
        const firstLetter = cd[0];
        const remaining = cd.substring(1);
        if (firstLetter !== 'a' || isNaN(remaining)) return;
        held.setStackSize(remaining);
        items[heldName] = remaining;
    } else if (heldName in items) return;
    else {
        held.setStackSize(cd);
        items[heldName] = cd;
    }
}), () => data.cooldownlist.length !== 0);

registerWhen(register("worldUnload", () => {
    items = {};
}), () => data.cooldownlist.length !== 0);

/**
 * Update function for handling cooldowns and item stack sizes.
 */
let filteredItems = undefined;
registerWhen(register("tick", () => {
    const dupe = new Set();
    filteredItems = Player.getInventory().getItems().filter(item => item !== null && item.getName() in items);
    filteredItems.forEach(item => {
        const itemName = item.getName();
        if (!dupe.has(itemName)) {
            items[itemName] -= 0.05;
            dupe.add(itemName);
        }

        const cd = Math.ceil(items[itemName]);
        if (isNaN(cd)) delete items[itemName];
        else if (cd <= 0) {
            if (settings.cooldownAlert) Client.Companion.showTitle("", `${itemName} ${GREEN}is Ready!`, 5, 25, 5);
            item.setStackSize(1);
            delete items[itemName];
        }
    });
}), () => data.cooldownlist.length !== 0);

/**
 * Change stack size during renderHotbar for smoother countdown.
 */
registerWhen(register("renderHotbar", () => {
    if (filteredItems === undefined || filteredItems.length === 0) return;
    
    filteredItems = Player.getInventory().getItems().filter(item => item !== null && item.getName() in items);
    filteredItems.forEach(item => {
        const itemName = item.getName();

        const cd = Math.ceil(items[itemName]);
        if (isNaN(cd)) delete items[itemName];
        else item.setStackSize(cd);
    });
}), () => data.cooldownlist.length !== 0);
