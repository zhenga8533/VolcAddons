import settings from "../../utils/settings";
import { BOLD, GOLD, RED } from "../../utils/constants";
import { registerWhen } from "../../utils/variables";


/**
 * Variable used to represent player's held item.
 */
let heldItem = undefined;

/**
 * Tracks action bar for "CASTING" and held item to detect when Ragnarok ability goes off.
 */
registerWhen(register("actionBar", () => {
    if (Player.getHeldItem() === null) return;
    heldItem = Player.getHeldItem().getNBT().getCompoundTag("tag").getCompoundTag("ExtraAttributes").getString("id");

    if (heldItem.equals("RAGNAROCK_AXE"))
        Client.showTitle(`${GOLD + BOLD}AWOOGA!`, "", 0, 25, 5);
}).setCriteria("${before}CASTING"), () => settings.ragDetect);

/**
 * Tracks chat for rag cancelled message to display alert on screen.
 */
registerWhen(register("chat", () => {
    Client.showTitle(`${RED + BOLD}CANCELLED!`, "", 0, 25, 5);
}).setCriteria("Ragnarock was cancelled due to being hit!"), () => settings.ragDetect);
