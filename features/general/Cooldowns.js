import settings from "../../utils/settings";
import { GREEN } from "../../utils/constants";
import { data, registerWhen } from "../../utils/variables";


/**
 * Callback for handling mouse button clicks and releases to track ability usage.
 */
let items = {};
registerWhen(register("clicked", (x, y, button, down) => {
    const held = Player.getHeldItem();
    if (Client.isInGui() || !down || held === null) return;
    const heldName = held?.getItemNBT()?.getCompoundTag("tag")?.getCompoundTag("ExtraAttributes")?.getString("id");
    if (!(heldName in data.cdlist)) return;

    const cd = data.cdlist[heldName];
    if (isNaN(cd)) {
        const firstLetter = cd[0];
        const remaining = cd.substring(1);
        if (isNaN(remaining)) return;

        if (firstLetter === 'a' || (firstLetter === 'l' && !(heldName in items) && button === 0)) {
            held.setStackSize(remaining);
            items[heldName] = [remaining, held.getName()];
        }
    } else if (button === 1 && !(heldName in items)) {
        held.setStackSize(cd);
        items[heldName] = [cd, held.getName()];
    }
}), () => data.cdlist.length !== 0);

/**
 * Handles shift to track ability.
 */
const shiftKey = new KeyBind(Client.getMinecraft().field_71474_y.field_74311_E);
shiftKey.registerKeyPress(() => {
    // Get armor pieces
    const armor = Player.armor;
    const pieces = [
        armor.getHelmet(),
        armor.getChestplate(),
        armor.getLeggings(),
        armor.getBoots()
    ];
    
    // Loop through to check in cd list
    pieces.forEach(piece => {
        const pieceName = piece?.getItemNBT()?.getCompoundTag("tag")?.getCompoundTag("ExtraAttributes")?.getString("id");
        const cd = data.cdlist[pieceName];
        if (cd === undefined) return;

        // cooldown checks
        if (pieceName in items) return;
        const firstLetter = cd[0];
        const remaining = cd.substring(1);

        if (firstLetter === 's' && !isNaN(remaining)) {
            piece.setStackSize(remaining);
            items[pieceName] = [remaining, piece.getName()];
        } else if (!isNaN(cd)) {
            piece.setStackSize(cd);
            items[pieceName] = [cd, piece.getName()];
        }
    });
});

/**
 * Reset cooldowns on worldchange
 */
registerWhen(register("worldUnload", () => {
    items = {};
}), () => data.cdlist.length !== 0);

/**
 * Update function for handling cooldowns and item stack sizes.
 */
let filteredItems = undefined;
registerWhen(register("tick", () => {
    const dupe = new Set();
    filteredItems = Player.getInventory().getItems().filter(item =>
        item !== null && item?.getItemNBT()?.getCompoundTag("tag")?.getCompoundTag("ExtraAttributes")?.getString("id") in items);
    filteredItems.forEach(item => {
        const itemID = item?.getItemNBT()?.getCompoundTag("tag")?.getCompoundTag("ExtraAttributes")?.getString("id");
        const itemName = items[itemID][1];
        if (!dupe.has(itemID)) {
            items[itemID][0] -= 0.05;
            dupe.add(itemID);
        }

        const cd = Math.ceil(items[itemID][0]);
        if (isNaN(cd)) delete items[itemID];
        else if (cd <= 0) {
            if (settings.cooldownAlert)
                Client.showTitle(itemName, `${GREEN}is off cooldown!`, 5, 25, 5);
            item.setStackSize(1);
            delete items[itemID];
        }
    });
}), () => data.cdlist.length !== 0);

/**
 * Change stack size during renderHotbar for smoother countdown.
 */
registerWhen(register("renderHotbar", () => {
    if (filteredItems === undefined || filteredItems.length === 0) return;
    
    filteredItems = Player.getInventory().getItems().filter(item =>
        item !== null && item?.getItemNBT()?.getCompoundTag("tag")?.getCompoundTag("ExtraAttributes")?.getString("id") in items);
    filteredItems.forEach(item => {
        const itemID = item?.getItemNBT()?.getCompoundTag("tag")?.getCompoundTag("ExtraAttributes")?.getString("id");

        const cd = Math.ceil(items[itemID][0]);
        if (isNaN(cd)) delete items[itemID];
        else item.setStackSize(cd);
    });
}), () => data.cdlist.length !== 0);
