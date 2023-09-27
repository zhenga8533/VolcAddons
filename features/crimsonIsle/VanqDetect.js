import settings from "../../utils/settings";
import { AMOGUS, BOLD, DARK_PURPLE, RED, WHITE } from "../../utils/constants";
import { announceMob, playSound } from "../../utils/functions";
import { Overlay } from "../../utils/overlay";
import { data, registerWhen } from "../../utils/variables";
import { getWorld } from "../../utils/worlds";
import { renderEntities } from "../../utils/waypoints";


/**
 * Vanquisher detection variables.
 */
const WITHER_CLASS = Java.type('net.minecraft.entity.boss.EntityWither').class;
let vanquishers = [];

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
const vanqExample = `${DARK_PURPLE + BOLD}Vanquisher ${WHITE}Detected`;
const vanqOverlay = new Overlay("vanqDetect", ["Crimson Isle"], () => true, data.QL, "moveVanq", vanqExample);
vanqOverlay.message = "";
registerWhen(register("step", () => {
    vanquishers = World.getAllEntitiesOfType(WITHER_CLASS).filter(entity => entity.getEntity().func_110138_aP() === 1024);

    if (vanquishers.length > 0) {
        if (vanquishers.find(vanquisher => vanquisher.getEntity().func_110143_aJ() === 0) !== undefined)
            vanqOverlay.message = `${DARK_PURPLE + BOLD}Vanquisher ${RED}Dead!`;
        else vanqOverlay.message = vanqExample;
        
        if (settings.vanqSound)playSound(AMOGUS, 10000);
        if (!data.moblist.includes("vanquisher")) vanquishers = [];
    } else vanqOverlay.message = "";
}).setFps(2), () => getWorld() === "Crimson Isle" && settings.vanqDetect);
registerWhen(register("renderWorld", () => {
    renderEntities(vanquishers, 0.5, 0, 0.5);
}), () => getWorld() === "Crimson Isle" && settings.vanqDetect);
register("worldUnload", () => vanquishers = []);
