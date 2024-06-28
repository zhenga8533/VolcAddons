import { GREEN, LOGO } from "../../utils/Constants";
import { data } from "../../utils/Data";
import location from "../../utils/Location";
import mayor from "../../utils/Mayor";
import { registerWhen } from "../../utils/RegisterTils";
import Settings from "../../utils/Settings";
import { delay } from "../../utils/ThreadTils";
import Waypoint from "../../utils/Waypoint";
import { getClosest } from "../../utils/functions/find";

/**
 * Key press to warp player to closest burrow.
 */
const guessed = new Waypoint([1, 1, 0]); // Yellow Guess
let warp = "player";
const dianaKey = new KeyBind("Diana Warp", data.dianaKey, "./VolcAddons.xdd");
register("gameUnload", () => {
  data.dianaKey = dianaKey.getKeyCode();
}).setPriority(Priority.HIGHEST);
dianaKey.registerKeyPress(() => {
  if (Settings.dianaWarp && warp !== "player") {
    ChatLib.chat(`${LOGO + GREEN}Warping to "${warp}"...`);
    ChatLib.command(`warp ${warp}`);
  }
});

/**
 * Populates the `warps` array with warp data from `WARPS` and `data.dianalist`.
 */
let warps = [];
const WARPS = {
  hub: [-2.5, 70, -69.5],
  castle: [-250, 130, 45],
  da: [91.5, 75, 173.5],
  museum: [-75.5, 76, 80.5],
  crypt: [-161.5, 61, -99.5],
  wizard: [42.5, 122, 69],
};
export function setWarps() {
  warps = [["player", 0, 0, 0]];

  data.dianalist.forEach((loc) => {
    if (loc in WARPS) warps.push([loc, WARPS[loc][0], WARPS[loc][1], WARPS[loc][2]]);
  });
}
setWarps();

/**
 * Use linear regression to calculate a best-fit line using particle locations.
 *
 * @param {Array[Number[]]} coordinates - xyz coordinates of Echo ability particles.
 * @param {Number} distance - Wanted distance to be calculated using best fit line.
 * @returns {[String, Number, Number, Number]} - [Title, X, Y, Z]
 */
function guessBurrow(coordinates, distance) {
  const n = coordinates.length;
  let sumX = 0,
    sumY = 0,
    sumZ = 0,
    sumXY = 0,
    sumXZ = 0,
    sumYZ = 0,
    sumX2 = 0,
    sumY2 = 0;

  for (const [x, y, z] of coordinates) {
    sumX += x;
    sumY += y;
    sumZ += z;
    sumXY += x * y;
    sumXZ += x * z;
    sumYZ += y * z;
    sumX2 += x * x;
    sumY2 += y * y;
  }

  // Find the coordinate at the specified distance
  const x1 = coordinates[0][0];
  const y1 = coordinates[0][1];
  const z1 = coordinates[0][2];

  const x2 = coordinates[n - 1][0];
  const y2 = coordinates[n - 1][1];
  const z2 = coordinates[n - 1][2];

  const guess = [x1 + (x2 - x1) * distance, y1 + (y2 - y1) * distance - distance, z1 + (z2 - z1) * distance];

  // Get closest warp location
  warps[0] = ["player", Player.getX(), Player.getY(), Player.getZ()];
  warp = getClosest(["Guess", ...guess], warps)[0][0];

  return [`/warp ${warp}`, ...guess];
}

/**
 * Variables used to calculate guess
 */
let path = [[0, 0, 0]];
let distance = 0;

/**
 * Track when player uses ancestral spade
 */
let echo = false;
registerWhen(
  register("clicked", (_, __, button, isButtonDown) => {
    if (button !== 1 || !isButtonDown || echo || !Player.getHeldItem().getName().endsWith("Ancestral Spade")) return;

    echo = true;
    delay(() => (echo = false), 3000);
    path = [[Player.getX(), Player.getY(), Player.getZ()]];
  }),
  () => location.getWorld() === "Hub" && mayor.getPerks().has("Mythological Ritual") && Settings.dianaWaypoint
);

/**
 * Use Ancestral Spade particles to guess a burrow location.
 */
registerWhen(
  register("spawnParticle", (particle, type) => {
    if (type.toString() !== "FIREWORKS_SPARK") return;

    // Check for distance disparity between particle spawns to ignore strays
    const last = path[path.length - 1];
    const [x, y, z] = [particle.getX(), particle.getY(), particle.getZ()];
    const span = Math.hypot(x - last[0], y - last[1], z - last[2]);
    if (span > 3) return;

    // Push to particles list and make a guess
    path.push([x, y, z]);
    guessed.clear();
    guessed.push(guessBurrow(path, distance));
  }),
  () => location.getWorld() === "Hub" && mayor.getPerks().has("Mythological Ritual") && Settings.dianaWaypoint
);

/**
 * Get distance using Echo note pitch.
 */
registerWhen(
  register("soundPlay", (_, __, ___, pitch) => {
    distance =
      (Math.E / pitch) ** (Math.E + (1 - 2 * pitch)) - Math.E ** (1 - pitch ** 2) + Math.E ** (0.8 - Math.E * pitch);
  }).setCriteria("note.harp"),
  () => location.getWorld() === "Hub" && mayor.getPerks().has("Mythological Ritual") && Settings.dianaWaypoint
);
