import { BOLD, DARK_GRAY, GOLD, RED, WHITE } from "../../utils/Constants";
import { registerWhen } from "../../utils/RegisterTils";
import Settings from "../../utils/Settings";
import { setTitle } from "../../utils/Title";
import { formatNumber } from "../../utils/functions/format";

/**
 * Variable used to represent player's held item.
 */
let heldItem = undefined;

/**
 * Tracks action bar for "CASTING" and held item to detect when Ragnarok ability goes off.
 */
registerWhen(
  register("actionBar", () => {
    if (Player.getHeldItem() === null) return;
    heldItem = Player.getHeldItem().getNBT().getCompoundTag("tag").getCompoundTag("ExtraAttributes").getString("id");

    if (heldItem.equals("RAGNAROCK_AXE")) {
      const strength =
        Player.getHeldItem()
          .getLore()
          .find((line) => line.startsWith("§5§o§7Strength:"))
          ?.split(" ")?.[1]
          ?.substring(3) ?? 0;
      setTitle(
        `${GOLD + BOLD}AWOOGA!`,
        strength === 0 ? "" : `${DARK_GRAY}+${WHITE + formatNumber(strength * 1.5) + RED} Strength`,
        0,
        25,
        99
      );
    }
  }).setCriteria("${before}CASTING"),
  () => Settings.ragDetect
);

/**
 * Tracks chat for rag cancelled message to display alert on screen.
 */
registerWhen(
  register("chat", () => {
    setTitle(`${RED + BOLD}RAGNAROCK CANCELLED!`, "", 0, 25, 5, 99);
  }).setCriteria("Ragnarock was cancelled due to taking damage!"),
  () => Settings.ragDetect
);
