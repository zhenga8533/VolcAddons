import { GIANT_CLASS, STAND_CLASS } from "../../utils/constants";
import settings from "../../utils/settings";
import { registerWhen } from "../../utils/variables";
import { getWorld } from "../../utils/worlds";
import { getPhase } from "./KuudraSplits";


/**
 * Variables used to track and display crate locations.
 */
let crates = [];
export function getCrates() { return crates };
let builds = [];
export function getBuilds() { return builds };

/**
 * Tracks crates near player and colors them depending on how close they are.
 */
registerWhen(register("tick", () => {
    if (getPhase() !== 1 && getPhase() !== 3) return;
    
    const gzs = World.getAllEntitiesOfType(GIANT_CLASS);
    const supplies = gzs.filter(gz => gz.getY() < 67);
    const player = Player.asPlayerMP();

    crates = supplies.map(supply => {
        const yaw = supply.getYaw();
        const distance = player.distanceTo(supply);
        const x = supply.getX() + 5 * Math.cos((yaw + 130) * (Math.PI / 180));
        const z = supply.getZ() + 5 * Math.sin((yaw + 130) * (Math.PI / 180));
        return [x, 75, z, distance > 32 ? 1 : 0, 1, distance > 32 ? 1 : 0];
    });
}), () => getWorld() === "Kuudra" && settings.kuudraCrates);

/**
 * Marks build piles that are not completed.
 */
registerWhen(register("step", () => {
    if (getPhase() !== 2) return;

    builds = [];
    const stands = World.getAllEntitiesOfType(STAND_CLASS);
    const piles = stands.filter(stand => stand.getName().includes('PUNCH'));
    piles.forEach((pile) => { builds.push([pile.getX(), pile.getY(), pile.getZ(), 1, 0, 0]) });
}).setFps(2), () => getWorld() === "Kuudra" && settings.kuudraBuild);

/**
 * Marks build piles that are not completed.
 */
register("worldUnload", () => {
    crates = [];
    builds = [];
});
