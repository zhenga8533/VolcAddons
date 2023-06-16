import settings from "../../settings";
import { data, registerWhen } from "../../utils/variables";

const EntityArmorStand = Java.type("net.minecraft.entity.item.EntityArmorStand");
const EntityGiantZombie = Java.type("net.minecraft.entity.monster.EntityGiantZombie");
let crates = [];
let builds = [];
let phase = 1;

// Tracks phase
registerWhen(register("chat", () => {
    phase = 1;
}).setCriteria("[NPC] Elle: Okay adventurers, I will go and fish up Kuudra!"), () => data.world == "kuudra");

registerWhen(register("chat", () => {
    phase = 2;
}).setCriteria("[NPC] Elle: OMG! Great work collecting my supplies!"), () => data.world == "kuudra");

registerWhen(register("chat", () => {
    phase = 3;
}).setCriteria("[NPC] Elle: Phew! The Ballista is finally ready! It should be strong enough to tank Kuudra's blows now!"),
() => data.world == "kuudra");

registerWhen(register("chat", () => {
    phase = 4;
}).setCriteria("[NPC] Elle: POW! SURELY THAT'S IT! I don't think he has any more in him!"),
() => data.world == "kuudra");

// Supplies
registerWhen(register("tick", () => {
    if (phase != 1 && phase != 3) return;
    
    crates = [];
    const gzs = World.getAllEntitiesOfType(EntityGiantZombie.class);
    const supplies = gzs.filter(gz => gz.getY() < 67)
    supplies.forEach((supply) => {
        let stands = supply.getChunk().getAllEntitiesOfType(EntityArmorStand.class);
        let active = stands.filter(stand => stand.getName().includes('SUPPLIES') || stand.getName().includes('FUEL CELL'));

        if (active.length)
            active.forEach(crate => { crates.push([crate.getX(), crate.getY(), crate.getZ(), 0, 1, 0]) });
        else {
            // Try to detect if just too far or in different chunk
            x = supply.getX();
            z = supply.getZ();
            // Get 3x3 chunks surrounding crate
            active.push(...World.getChunk(x + 8, 69, z + 8).getAllEntitiesOfType(EntityArmorStand.class));
            active.push(...World.getChunk(x + 8, 69, z - 8).getAllEntitiesOfType(EntityArmorStand.class));
            active.push(...World.getChunk(x - 8, 69, z + 8).getAllEntitiesOfType(EntityArmorStand.class));
            active.push(...World.getChunk(x - 8, 69, z - 8).getAllEntitiesOfType(EntityArmorStand.class));
            active.push(...World.getChunk(x + 8, 69, z).getAllEntitiesOfType(EntityArmorStand.class));
            active.push(...World.getChunk(x - 8, 69, z).getAllEntitiesOfType(EntityArmorStand.class));
            active.push(...World.getChunk(x, 69, z + 8).getAllEntitiesOfType(EntityArmorStand.class));
            active.push(...World.getChunk(x, 69, z - 8).getAllEntitiesOfType(EntityArmorStand.class));

            active = active.filter(stand => stand.getName().includes('SUPPLIES') || stand.getName().includes('FUEL CELL'));
            if (active.length)
                active.forEach(crate => { crates.push([crate.getX(), crate.getY(), crate.getZ(), 0, 1, 0]) });
            else
                crates.push([supply.getX(), supply.getY(), supply.getZ(), 1, 1, 1]);
        }
    });
}), () => data.world == "kuudra" && settings.kuudraCrates);

// Build
registerWhen(register("step", () => {
    if (phase != 2) return;

    builds = [];
    const stands = World.getAllEntitiesOfType(EntityArmorStand.class);
    const piles = stands.filter(stand => stand.getName().includes('PUNCH'));
    piles.forEach((pile) => { builds.push([pile.getX(), pile.getY(), pile.getZ(), 1, 0, 0]) });
}).setFps(2), () => data.world == "kuudra" && settings.kuudraBuild);

register("worldUnload", () => {
    crates = [];
    builds = [];
});

export function getCrates() {
    return crates;
}
export function getBuilds() {
    return builds;
}
// Waypoints loaded in DrawWaypoint
