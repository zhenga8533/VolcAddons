import settings from "../../settings";
import { get3x3Stands } from "../../utils/functions";
import { delay } from "../../utils/thread";
import { registerWhen } from "../../utils/variables";


/**
 * Variable used to track all damage ticks around player.
 */
const damaged = [];

/**
 * Tracks any instance of damage around the player and displays it in chat.
 */
registerWhen(register("step", () => {
    const stands = get3x3Stands(Player.getX(), Player.getZ(), 16);
    const damage = stands.filter(stand => stand.getName().includes(","));

    damage.forEach(num => {
        dmg = num.getName();
        if (!damaged.includes(dmg)) {
            ChatLib.chat(dmg);
            damaged.push(dmg);
            delay(() => damaged.shift(), 1000);
        }
    });
}).setFps(2), () => settings.damageTracker);
