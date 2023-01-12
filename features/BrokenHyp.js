import settings from "../settings"
import {COLORS} from "../constants"
import {FORMATS} from "../constants"

var tracker_kills = 0
var tracker_xp = 0

register("tick", () => {
    if(settings.brokenHyp && Player.getHeldItem() != null) {
        const heldItem = Player.getHeldItem().getName();
        if(heldItem.includes("Hyperion") || heldItem.includes("Astraea") || heldItem.includes("Scylla") || heldItem.includes("Valkyrie") || heldItem.includes("Sussy Baka")) {
            new_kills = Player.getHeldItem().getNBT().getCompoundTag("tag").getCompoundTag("ExtraAttributes").getInteger("stats_book");
            new_xp = Player.getHeldItem().getNBT().getCompoundTag("tag").getCompoundTag("ExtraAttributes").getDouble("champion_combat_xp");
            kill_difference = new_kills - tracker_kills;

            if(tracker_kills != new_kills) {
                if(tracker_xp == new_xp) {
                    Client.Companion.showTitle(`${FORMATS.BOLD}${COLORS.DARK_RED}HYPE BROKEN!`, "", 10, 50, 10)
                }

                tracker_kills = new_kills
                tracker_xp = new_xp
            }
        }
    }
})