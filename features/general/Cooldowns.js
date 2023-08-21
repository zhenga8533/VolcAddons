import settings from "../../settings";
import { GREEN } from "../../utils/constants";
import { data, registerWhen } from "../../utils/variables";


const items = {};
registerWhen(register("clicked", (x, y, button, down) => {
    if (Client.isInGui()) return;
    const held = Player.getHeldItem();
    const heldName = held.getName();
    if (down === false || !(heldName in data.cooldownlist) || heldName in items) return;
    const cd = data.cooldownlist[heldName];
    if (isNaN(cd)) return;
    held.setStackSize(cd);
    items[heldName] = cd;
}), () => data.cooldownlist.length !== 0);

registerWhen(register("tick", () => {
    const dupe = new Set();
    Player.getInventory().getItems().filter(item => item !== null && item.getName() in items).forEach(item => {
        const itemName = item.getName();
        if (dupe.has(itemName)) return;
        dupe.add(itemName);

        items[itemName] -= 0.05;
        const cd = Math.ceil(items[itemName]);
        if (isNaN(cd)) delete items[itemName];
        else if (cd <= 0) {
            if (settings.cooldownAlert) Client.Companion.showTitle("", `${GREEN}${itemName.removeFormatting()} is Ready!`, 5, 25, 5);
            item.setStackSize(1);
            delete items[itemName];
        } else item.setStackSize(cd);
    });
}), () => data.cooldownlist.length !== 0);
