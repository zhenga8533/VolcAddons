import settings from "../../settings";
import { BOLD, GOLD } from "../../utils/constants";
import { registerWhen } from "../../utils/variables";

let heldItem = undefined;

registerWhen(register("soundPlay", (pos, name, vol, pitch, category, event) => {
    if (Player.getHeldItem() == null) return;

    // Detect howl when Ragnarok finishes (Pitch => 1.49)
    if (pitch.toFixed(2) == 1.49) {
        heldItem = Player.getHeldItem().getNBT().getCompoundTag("tag").getCompoundTag("ExtraAttributes").getString("id");

        if (heldItem.equals("RAGNAROCK_AXE"))
            Client.Companion.showTitle(`${GOLD}${BOLD}AWOOGA!`, "", 5, 50, 5);
    }
}).setCriteria("mob.wolf.howl"), () => settings.ragDetect);
