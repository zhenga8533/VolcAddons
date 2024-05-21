import settings from "../../utils/Settings";
import { BOLD, DARK_GRAY, GOLD, GRAY, RED, WHITE } from "../../utils/Constants";
import { registerWhen } from "../../utils/RegisterTils";
import { formatNumber } from "../../utils/functions/format";


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

    if (heldItem.equals("RAGNAROCK_AXE")) {
        const strength = Player.getHeldItem().getLore().find(line => line.startsWith("§5§o§7Strength:"))?.split(' ')?.[1]?.substring(3) ?? 0;
        Client.showTitle(`${GOLD + BOLD}AWOOGA!`, strength === 0 ? "" : `${DARK_GRAY}+${WHITE + formatNumber(strength * 1.5) + RED} Strength`, 0, 25, 5);
    }
}).setCriteria("${before}CASTING"), () => settings.ragDetect);

/**
 * Tracks chat for rag cancelled message to display alert on screen.
 */
registerWhen(register("chat", () => {
    Client.showTitle(`${RED + BOLD}Ragnarok Cancelled!`, GRAY + "Damage was taken...", 5, 25, 5);
}).setCriteria("Ragnarock was cancelled due to taking damage!"), () => settings.ragDetect);
