import settings from "../settings";
import { getWorld } from "../utils/variables";

const EntityArmorStand = Java.type("net.minecraft.entity.item.EntityArmorStand");
const EntityGiantZombie = Java.type("net.minecraft.entity.monster.EntityGiantZombie");
let crates = [];
let builds = [];
let phase = 1;

// Tracks phase
register("chat", () => {
    phase = 1;
}).setCriteria("[NPC] Elle: Okay adventurers, I will go and fish up Kuudra!");

register("chat", () => {
    phase = 2;
}).setCriteria("[NPC] Elle: OMG! Great work collecting my supplies!");

register("chat", () => {
    phase = 3;
}).setCriteria("[NPC] Elle: Phew! The Ballista is finally ready! It should be strong enough to tank Kuudra's blows now!");

register("chat", () => {
    phase = 4;
}).setCriteria("[NPC] Elle: POW! SURELY THAT'S IT! I don't think he has any more in him!");

// Supplies
register("tick", () => {
    if ((getWorld() != "kuudra t5" && getWorld() != "kuudra f4") || !settings.kuudraCrates || (phase != 1 && phase != 3)) return;
    
    crates = [];
    const gzs = World.getAllEntitiesOfType(EntityGiantZombie.class);
    const supplies = gzs.filter(gz => gz.getY() < 70)
    supplies.forEach((supply) => { crates.push(['Crate', supply.getX(), supply.getY() + 10, supply.getZ()]) });
});

// Build
register("step", () => {
    if ((getWorld() != "kuudra t5" && getWorld() != "kuudra f4") || !settings.kuudraBuild || phase != 2) return;

    builds = [];
    const stands = World.getAllEntitiesOfType(EntityArmorStand.class);
    const piles = stands.filter(stand => stand.getName().includes('PUNCH'))
    piles.forEach((pile) => { builds.push(['LF Bob', pile.getX(), pile.getY(), pile.getZ()]) });
}).setDelay(1);

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