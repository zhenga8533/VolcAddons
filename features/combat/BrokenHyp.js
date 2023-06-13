import settings from "../../settings";
import { BOLD, DARK_RED } from "../../utils/constants";
import { registerWhen } from "../../utils/variables";

const WITHER_BLADES = ["HYPERION", "ASTRAEA", "SCYLLA", "VALKYRIE", "NECRON_BLADE_UNREFINED"];
let heldItem = undefined;

let broken = false;
let trackerKills = 0;
let trackerXP = 0;
let newKills = 0;
let newXP = 0;

registerWhen(register("entityDeath", () => { // (boppeler21 cutie)
    if (Player.getHeldItem() == null) return;

    // Update held item
    heldItem = Player.getHeldItem().getNBT().getCompoundTag("tag").getCompoundTag("ExtraAttributes");

    // IF Wither Blade is held THEN track kills and xp
    if (WITHER_BLADES.includes(heldItem.getString("id"))) {
        newKills = heldItem.getInteger("stats_book");
        newXP = heldItem.getDouble("champion_combat_xp");

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
