import settings from "../../utils/settings";
import { AMOGUS, BOLD, DARK_PURPLE, WHITE } from "../../utils/constants";
import { announceMob, playSound } from "../../utils/functions";
import { Overlay } from "../../utils/overlay";
import { data, registerWhen } from "../../utils/variables";
import { getWorld } from "../../utils/worlds";


/**
 * Vanquisher detection variables.
 */
const WITHER_CLASS = Java.type('net.minecraft.entity.boss.EntityWither').class;
let entities = [];
let vanquishers = [];
export function getVanquishers() { return vanquishers };

/**
 * Announce vanquisher spawn on chat message appears.
 */
registerWhen(register("chat", () => {
    announceMob(settings.vanqAlert, "Vanquisher", Player.getX(), Player.getY(), Player.getZ());
}).setCriteria("A Vanquisher is spawning nearby!"), () => getWorld() === "Crimson Isle" && settings.vanqAlert !== 0);

/**
 * Alerts player when another VA user posts coords.
 */
registerWhen(register("chat", () => {
    playSound(AMOGUS, 10000);
}).setCriteria("${player}: ${coords} | Vanquisher Spawned at [${location}]!"), () => getWorld() === "Crimson Isle" && settings.vanqSound);

/**
 * Tracks world for any vanquishers near player.
 */
const vanqExample = `${DARK_PURPLE}${BOLD}Vanquisher ${WHITE}Detected`;
const vanqOverlay = new Overlay("vanqDetect", ["Crimson Isle"], () => true, data.QL, "moveVanq", vanqExample);
vanqOverlay.message = "";
registerWhen(register("tick", () => {
    vanquishers = [];
    entities = World.getAllEntitiesOfType(WITHER_CLASS);
    vanqs = entities.filter(entity => entity.getEntity().func_110138_aP() === 1024);

    if (vanqs.length > 0) {
        vanqOverlay.message = vanqExample;
        if (data.moblist.includes("vanquisher")) {
            vanqs.forEach(vanq => { vanquishers.push(vanq) });
            if (settings.vanqSound) playSound(AMOGUS, 10000);
        }
    } else vanqOverlay.message = "";
}), () => getWorld() === "Crimson Isle" && settings.vanqDetect === true);
