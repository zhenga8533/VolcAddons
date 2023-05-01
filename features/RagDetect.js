import { BOLD, GOLD } from "../constants";
import settings from "../settings";

let heldItem = undefined;

register("soundPlay", (pos, name, vol, pitch, category, event) => {
    if (!settings.ragDetect || Player.getHeldItem() == null) return;

    // Detect howl when Ragnarok finishes (Pitch => 1.49)
    if (name.equals("mob.wolf.howl") && pitch.toFixed(2) == 1.49) {
        heldItem = Player.getHeldItem().getNBT().getCompoundTag("tag").getCompoundTag("ExtraAttributes").getString("id");

        if (heldItem.equals("RAGNAROCK_AXE"));
            Client.Companion.showTitle(`${GOLD}${BOLD}AWOOGA!`, "", 5, 50, 5);
    }
})