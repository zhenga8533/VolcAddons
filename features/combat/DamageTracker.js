import settings from "../../settings";
import { get3x3Stands } from "../../utils/functions";
import { delay } from "../../utils/thread";
import { registerWhen } from "../../utils/variables";

const damaged = [];


/**
 * Tracks any instance of damage around the player and displays it in chat.
 */
registerWhen(register("step", () => {
    const stands = get3x3Stands();
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
