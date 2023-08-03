import settings from "../../settings";
import { BOLD, DARK_RED } from "../../utils/constants";
import { registerWhen } from "../../utils/variables";


/**
 * Variables used for broken Wither Impact tracking.
 */
const WITHER_BLADES = new Set(["HYPERION", "ASTRAEA", "SCYLLA", "VALKYRIE", "NECRON_BLADE_UNREFINED"]);
let heldItem = undefined;
let broken = false;
let trackerKills = 0;
let trackerXP = 0;

/**
 * Tracks Book of Stats and Champion to detect when Wither Impact stops giving xp.
 * Announces a title whenever it does fail.
 */
registerWhen(register("entityDeath", () => { // (boppeler21 cutie)
    if (Player.getHeldItem() === null) return;

    // Update held item
    heldItem = Player.getHeldItem().getNBT().getCompoundTag("tag").getCompoundTag("ExtraAttributes");

    // IF Wither Blade is held THEN track kills and xp
    if (WITHER_BLADES.has(heldItem.getString("id"))) {
        const newKills = heldItem.getInteger("stats_book");
        const newXP = heldItem.getDouble("champion_combat_xp");

        if (trackerKills != newKills) {
            if (broken) broken = false;
            else if (trackerXP == newXP) {
                Client.Companion.showTitle(`${DARK_RED}${BOLD}HYPE BROKEN!`, "", 5, 25, 5);
                broken = true;
            }

            trackerKills = newKills;
            trackerXP = newXP;
        }
    }
}), () => settings.brokenHyp);
