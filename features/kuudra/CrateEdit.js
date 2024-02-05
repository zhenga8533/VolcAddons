import settings from "../../utils/settings";
import { Overlay } from "../../utils/overlay";
import { data, registerWhen } from "../../utils/variables";
import { getWorld } from "../../utils/worlds";


/**
 * Crate overlay variables.
 */
const crateExample = "§8[§a|||||||||||||§f|||||||§8] §b69%§r";
const crateOverlay = new Overlay("crateEdit", ["all"], () => getWorld() === "Kuudra", data.CEL, "moveCrate", crateExample);
crateOverlay.message = "";

/**
 * Cancel crate title render and replay with overlay render.
 */
registerWhen(register("renderTitle", (title, _, event) => {
    if (!title.startsWith("§8[") || !title.endsWith("%§r")) return;

    crateOverlay.message = title;
    cancel(event);
}), () => settings.crateEdit && getWorld() === "Kuudra");

/**
 * Reset on crate pickup/cancel
 */
register("chat", () => {
    Client.scheduleTask(20, () => crateOverlay.message = "");
}).setCriteria("You retrieved some of Elle's supplies from the Lava!");
register("chat", () => {
    Client.scheduleTask(20, () => crateOverlay.message = "");
}).setCriteria("You moved and the Chest slipped out of your hands!");
