import location from "../../utils/location";
import settings from "../../utils/settings";
import { GIANT_CLASS, STAND_CLASS } from "../../utils/constants";
import { registerWhen } from "../../utils/register";
import { getPhase } from "./KuudraSplits";
import { Waypoint } from "../../utils/WaypointUtil";


/**
 * Variables used to track and display crate locations.
 */
const crates = new Waypoint([1, 1, 1], true, false, true);
const builds = new Waypoint([1, 0, 0], true, false, true);

/**
 * Tracks crates near player and colors them depending on how close they are.
 */
registerWhen(register("tick", () => {
    if (getPhase() !== 1 && getPhase() !== 3) return;
    
    const gzs = World.getAllEntitiesOfType(GIANT_CLASS);
    const supplies = gzs.filter(gz => gz.getY() < 67);
    const player = Player.asPlayerMP();

    crates.set(supplies.map(supply => {
        const yaw = supply.getYaw();
        const distance = player.distanceTo(supply);
        const x = supply.getX() + 5 * Math.cos((yaw + 130) * (Math.PI / 180));
        const z = supply.getZ() + 5 * Math.sin((yaw + 130) * (Math.PI / 180));
        return [distance > 32 ? 1 : 0, 1, distance > 32 ? 1 : 0, x, 75, z];
    }));
}), () => location.getWorld() === "Kuudra" && settings.kuudraCrates);

/**
 * Marks build piles that are not completed.
 */
registerWhen(register("step", () => {
    if (getPhase() !== 2) return;

    builds.clear();
    const stands = World.getAllEntitiesOfType(STAND_CLASS);
    const piles = stands.filter(stand => stand.getName().includes('PUNCH'));
    piles.forEach(pile => builds.push([pile.getX(), pile.getY(), pile.getZ()]) );
}).setFps(2), () => location.getWorld() === "Kuudra" && settings.kuudraBuild);

/**
 * Marks build piles that are not completed.
 */
register("worldUnload", () => {
    crates.clear();
    builds.clear();
});
