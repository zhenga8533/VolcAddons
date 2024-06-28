import { GIANT_CLASS, STAND_CLASS } from "../../utils/Constants";
import location from "../../utils/Location";
import { registerWhen } from "../../utils/RegisterTils";
import Settings from "../../utils/Settings";
import Waypoint from "../../utils/Waypoint";
import { getPhase } from "./KuudraSplits";

/**
 * Variables used to track and display crate locations.
 */
const crates = new Waypoint([1, 1, 1], 1, false, true, false); // White Crates
const builds = new Waypoint([1, 0, 0], 1, false, true, false); // Red Builds

/**
 * Tracks crates near player and colors them depending on how close they are.
 */
registerWhen(
  register("tick", () => {
    if (getPhase() !== 1 && getPhase() !== 3) return;

    // Get all giant zombies and filter out the ones that are not on the ground
    const gzs = World.getAllEntitiesOfType(GIANT_CLASS);
    const supplies = gzs.filter((gz) => gz.getY() < 67);
    const player = Player.asPlayerMP();

    // Update waypoints
    crates.clear();
    supplies.forEach((supply) => {
      const yaw = supply.getYaw();
      const distance = player.distanceTo(supply);
      const x = supply.getX() + 5 * Math.cos((yaw + 130) * (Math.PI / 180)) + 0.5;
      const z = supply.getZ() + 5 * Math.sin((yaw + 130) * (Math.PI / 180)) + 0.5;
      crates.push([distance > 32 ? 1 : 0, 1, distance > 32 ? 1 : 0, x, 75, z]);
    });
  }),
  () => location.getWorld() === "Kuudra" && Settings.kuudraCrates
);

/**
 * Marks build piles that are not completed.
 */
registerWhen(
  register("step", () => {
    if (getPhase() !== 2) return;

    builds.clear();
    const stands = World.getAllEntitiesOfType(STAND_CLASS);
    const piles = stands.filter((stand) => stand.getName().includes("PUNCH"));
    piles.forEach((pile) => builds.push([pile.getX() + 0.5, pile.getY(), pile.getZ() + 0.5]));
  }).setFps(2),
  () => location.getWorld() === "Kuudra" && Settings.kuudraBuild
);
