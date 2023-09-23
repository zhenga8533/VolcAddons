import settings from "../../utils/settings";
import { registerWhen } from "../../utils/variables";


/**
 * Cancel left click bow animations.
 */
registerWhen(register("renderHand", () => {
    if (Player.getHeldItem()?.getRegistryName() !== "minecraft:bow") return;
    Player.getPlayer().field_70733_aJ = 0;
}), () => settings.bowCancel === true);
