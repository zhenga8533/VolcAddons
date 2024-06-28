import { AMOGUS, GRAY, LOGO, WHITE } from "../../utils/Constants";
import location from "../../utils/Location";
import mayor from "../../utils/Mayor";
import { registerWhen } from "../../utils/RegisterTils";
import Settings from "../../utils/Settings";
import { delay } from "../../utils/ThreadTils";
import Waypoint from "../../utils/Waypoint";
import { playSound } from "../../utils/functions/misc";

/**
 * Variables used for burrow tracking
 */
let echo = false;
const burrows = new Waypoint([0, 0.5, 0]); // Green Burrows
const lastBurrows = [
  [0, 0],
  [0, 0],
  [0, 0],
  [0, 0],
  [0, 0],
  [0, 0],
  [0, 0],
];

/**
 * Track when player uses ancestral spade
 */
registerWhen(
  register("clicked", (_, __, button, isButtonDown) => {
    if (button !== 1 || !isButtonDown || echo || !Player.getHeldItem().getName().endsWith("Ancestral Spade")) return;

    echo = true;
    delay(() => (echo = false), 3000);
  }),
  () => location.getWorld() === "Hub" && mayor.getPerks().has("Mythological Ritual") && Settings.burrowDetect !== 0
);

/**
 * Detect for mytholigical burrows
 */
registerWhen(
  register("spawnParticle", (particle, type) => {
    if (echo) return;

    const pos = particle.getPos();
    const [x, y, z] = [pos.getX(), pos.getY(), pos.getZ()];
    const xyz = [`§6Burrow`, x, y, z];
    const closest = burrows.getClosest(xyz);
    const waypoints = burrows.getWaypoints();

    switch (type.toString()) {
      case "FOOTSTEP":
        // Detect last burrow particles to prevent off by 1 waypoints
        if (lastBurrows.find((lastBurrow) => lastBurrow[0] === x && lastBurrow[1] === z) === undefined) {
          lastBurrows.shift();
          lastBurrows.push([x, z]);
          return;
        }

        // Detect for new burrows (> 3 distance away from current burrows)
        if (closest[1] > 3 && World.getBlockAt(x, y, x).type?.getName()) {
          // Add to burrows list
          burrows.push(xyz);

          // Announce burrow depending on settings
          if (Settings.burrowDetect === 2 || Settings.burrowDetect === 4) playSound(AMOGUS, 100);
          if (Settings.burrowDetect === 3 || Settings.burrowDetect === 4)
            ChatLib.chat(`${LOGO + WHITE}Burrow Detected at ${GRAY}x: ${x}, y: ${y}, z: ${z}!`);
        }
        break;
      case "CRIT_MAGIC":
        if (closest[1] < 3) waypoints[waypoints.indexOf(closest[0])][0] = `§aStart`;
        break;
      case "CRIT":
        if (closest[1] < 3) waypoints[waypoints.indexOf(closest[0])][0] = `§cMob`;
        break;
    }
  }),
  () => location.getWorld() === "Hub" && mayor.getPerks().has("Mythological Ritual") && Settings.burrowDetect !== 0
);

/**
 * Events to remove burrows from list
 */
registerWhen(
  register("chat", () => {
    const closest = burrows.getClosest(["Player", Player.getX(), Player.getY(), Player.getZ()]);
    const waypoints = burrows.getWaypoints();
    if (closest !== undefined) Client.scheduleTask(2, () => waypoints.splice(waypoints.indexOf(closest[0]), 1));
  }).setCriteria("You ${completed} Griffin ${burrow}! (${x}/4)"),
  () => location.getWorld() === "Hub" && mayor.getPerks().has("Mythological Ritual") && Settings.burrowDetect !== 0
);

registerWhen(
  register("chat", () => {
    burrows.clear();
  }).setCriteria(" ☠ You ${died}."),
  () => location.getWorld() === "Hub" && mayor.getPerks().has("Mythological Ritual") && Settings.burrowDetect !== 0
);
