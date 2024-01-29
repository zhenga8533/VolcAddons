import { AMOGUS, GRAY, LOGO, WHITE } from "../../utils/constants";
import { getClosest } from "../../utils/functions/find";
import { getPerks } from "../../utils/mayor";
import { playSound } from "../../utils/functions/misc";
import settings from "../../utils/settings";
import { delay } from "../../utils/thread";
import { registerWhen } from "../../utils/variables";
import { getWorld } from "../../utils/worlds";


/**
 * Variables used for burrow tracking
 */
let echo = false;
const burrows = [];
export function getBurrows() { return burrows };
const lastBurrows = [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]];

/**
 * Track when player uses ancestral spade
 */
registerWhen(register("clicked", (_, __, button, isButtonDown) => {
    if (button !== 1 || !isButtonDown || echo || !Player.getHeldItem().getName().endsWith("Ancestral Spade")) return;

    echo = true;
    delay(() => echo = false, 3000);
}), () => getWorld() === "Hub" && getPerks().has("Mythological Ritual") && settings.burrowDetect !== 0);

/**
 * Detect for mytholigical burrows
 */
registerWhen(register("spawnParticle", (particle, type) => {
    if (echo) return;

    const pos = particle.getPos();
    const [x, y, z] = [pos.getX(), pos.getY(), pos.getZ()];
    const xyz = [`§6Burrow`, x, y, z];
    const closest = getClosest(xyz, burrows);

    switch (type.toString()) {
        case "FOOTSTEP":
            // Detect last burrow particles to prevent off by 1 waypoints
            if (lastBurrows.find(lastBurrow => lastBurrow[0] === x && lastBurrow[1] === z) === undefined) {
                lastBurrows.shift();
                lastBurrows.push([x, z]);
                return;
            }
        
            // Detect for new burrows (> 3 distance away from current burrows)
            if (closest[1] > 3 && World.getBlockAt(x, y, x).type?.getName()) {
                // Add to burrows list
                burrows.push(xyz);
        
                // Announce burrow depending on settings
                if (settings.burrowDetect === 2 || settings.burrowDetect === 4) playSound(AMOGUS, 100);
                if (settings.burrowDetect === 3 || settings.burrowDetect === 4) ChatLib.chat(`${LOGO + WHITE}Burrow Detected at ${GRAY}x: ${x}, y: ${y}, z: ${z}!`);
            }
            break;
        case ("CRIT_MAGIC"):
            if (closest[1] < 3) burrows[burrows.indexOf(closest[0])][0] = `§aStart`;
            break;
        case ("CRIT"):
            if (closest[1] < 3) burrows[burrows.indexOf(closest[0])][0] = `§cMob`;
            break;
    }
}), () => getWorld() === "Hub" && getPerks().has("Mythological Ritual") && settings.burrowDetect !== 0);

/**
 * Events to remove burrows from list
 */
registerWhen(register("chat", () => {
    const closest = getClosest(["Player", Player.getX(), Player.getY(), Player.getZ()], burrows);
    if (closest !== undefined) Client.scheduleTask(2, () => burrows.splice(burrows.indexOf(closest[0]), 1));
}).setCriteria("You ${completed} Griffin ${burrow}! (${x}/4)"),
() => getWorld() === "Hub" && getPerks().has("Mythological Ritual") && settings.burrowDetect !== 0);

register("worldUnload", () => {
    burrows.length = 0;
});

registerWhen(register("chat", () => {
    burrows.length = 0;
}).setCriteria(" ☠ You ${died}."),
() => getWorld() === "Hub" && getPerks().has("Mythological Ritual") && settings.burrowDetect !== 0);
