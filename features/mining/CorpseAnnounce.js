import settings from "../../utils/settings";
import { getClosest } from "../../utils/functions/find";
import { getInParty } from "../../utils/party";
import { registerWhen } from "../../utils/variables";
import { getWorld } from "../../utils/worlds";


let corpses = [];

registerWhen(register("chat", () => {
    if (!getInParty()) return;
    const x = Math.round(Player.getX());
    const y = Math.round(Player.getY());
    const z = Math.round(Player.getZ());
    if (getClosest([x, y, z], corpses)[1] < 10) return;

    ChatLib.command(`pc x: ${x}, y: ${y}, z: ${z} | Frozen Corpse!`);
}).setCriteria("  FROZEN CORPSE LOOT! "), () => settings.corpseAnnounce && getWorld() === "Mineshaft");

registerWhen(register("chat", (_, x, y, z) => {
    corpses.push([x, y, z.split(' ')[0]]);
}).setCriteria("${player}: x: ${x}, y: ${y}, z: ${z}"), () => settings.corpseAnnounce && getWorld() === "Mineshaft");

register("worldUnload", () => {
    corpses = [];
});
