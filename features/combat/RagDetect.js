import settings from "../../settings";
import { BOLD, GOLD } from "../../utils/constants";
import { registerWhen } from "../../utils/variables";


/**
 * Variable used to represent player's held item.
 */
let heldItem = undefined;

/**
 * Tracks action bar for "CASTING" and held item to detect when Ragnarok ability goes off.
 */
registerWhen(register("actionBar", () => {
    if (Player.getHeldItem() == null) return;
    heldItem = Player.getHeldItem().getNBT().getCompoundTag("tag").getCompoundTag("ExtraAttributes").getString("id");

    if (heldItem.equals("RAGNAROCK_AXE"))
        Client.Companion.showTitle(`${GOLD}${BOLD}AWOOGA!`, "", 0, 25, 5);
}).setCriteria("${before}CASTING"), () => settings.skillTracker);
