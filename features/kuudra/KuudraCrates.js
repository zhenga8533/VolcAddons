import settings from "../../settings";
import { get3x3Stands } from "../../utils/functions";
import { registerWhen } from "../../utils/variables";
import { getWorld } from "../../utils/worlds";
import { getPhase } from "./KuudraSplits";


/**
 * Variables used to track and display crate locations.
 */
const EntityArmorStand = Java.type("net.minecraft.entity.item.EntityArmorStand");
const EntityGiantZombie = Java.type("net.minecraft.entity.monster.EntityGiantZombie");
let crates = [];
export function getCrates() { return crates };
let builds = [];
export function getBuilds() { return builds };
const re = /SUPPLIES|FUEL CELL/;

/**
 * Tracks crates near player and colors them depending on how close they are.
 */
registerWhen(register("tick", () => {
    if (getPhase() != 1 && getPhase() != 3) return;
    
    crates = [];
    const gzs = World.getAllEntitiesOfType(EntityGiantZombie.class);
    const supplies = gzs.filter(gz => gz.getY() < 67)
    supplies.forEach((supply) => {
        let stands = supply.getChunk().getAllEntitiesOfType(EntityArmorStand.class);
        let active = stands.filter(stand => re.test(stand.getName()));

        if (active.length)
            active.forEach(crate => { crates.push([crate.getX(), crate.getY(), crate.getZ(), 0, 1, 0]) });
        else {
            // Try to detect if just too far or in different chunk
            x = supply.getX();
            z = supply.getZ();
            active.push(...get3x3Stands(x, z, 8));

            const active = active.filter(stand => re.test(stand.getName()));
            if (active.length)
                active.forEach(crate => { crates.push([crate.getX(), crate.getY(), crate.getZ(), 0, 1, 0]) });
            else
                crates.push([supply.getX(), supply.getY(), supply.getZ(), 1, 1, 1]);
        }
    });
}), () => getWorld() == "Kuudra" && settings.kuudraCrates);

/**
 * Marks build piles that are not completed.
 */
registerWhen(register("step", () => {
    if (getPhase() != 2) return;

    builds = [];
    const stands = World.getAllEntitiesOfType(EntityArmorStand.class);
    const piles = stands.filter(stand => /PUNCH/.test(stand.getName()));
    piles.forEach((pile) => { builds.push([pile.getX(), pile.getY(), pile.getZ(), 1, 0, 0]) });
}).setFps(2), () => getWorld() == "Kuudra" && settings.kuudraBuild);

/**
 * Marks build piles that are not completed.
 */
register("worldUnload", () => {
    crates = [];
    builds = [];
});
