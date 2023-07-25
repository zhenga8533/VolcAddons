import settings from "../../settings";
import { BOLD, GOLD } from "../../utils/constants";
import { registerWhen } from "../../utils/variables";

let heldItem = undefined;


/**
 * Uses sound name and pitch to determine whenever Ragnarok Ability goes off.
 *
 * @param {number[]} pos - Array of x, y, z positions.
 * @param {string} name - Name of sound.
 * @param {string} vol - Volume of sound.
 * @param {string} pitch - pitch of sound.
 * @param {string} category - Sound category.
 */

/**
 * Tracks action bar for "CASTING" and held item to detect when Ragnarok ability goes off.
 */
registerWhen(register("actionBar", () => {
    if (Player.getHeldItem() == null) return;
    heldItem = Player.getHeldItem().getNBT().getCompoundTag("tag").getCompoundTag("ExtraAttributes").getString("id");

    if (heldItem.equals("RAGNAROCK_AXE"))
        Client.Companion.showTitle(`${GOLD}${BOLD}AWOOGA!`, "", 0, 25, 5);
}).setCriteria("${before}CASTING"), () => settings.skillTracker);
