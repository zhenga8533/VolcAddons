import settings from "../settings";
import { getWorld } from "../variables";

const EntityArmorStand = Java.type("net.minecraft.entity.item.EntityArmorStand");
let entities = [];
let crates = [];

register("step", () => {
    if ((getWorld() != "kuudra t5" && getWorld() != "kuudra f4") || !settings.kuudraCrates) return;

    entities = World.getAllEntitiesOfType(EntityArmorStand.class);
    crates = [];

    entities.forEach((entity) => {
        const name = entity.getName().removeFormatting();
        if (name.includes('SUPPLIES') || name.includes('FUEL CELL')) {
            const coords = ['Crate', entity.getX(), entity.getY(), entity.getZ()];
            crates.push(coords);
        }
    });
}).setFps(5);

register("worldUnload", () => {
    crates = [];
});

export function getCrates() {
    return crates;
}

// Waypoints loaded in DrawWaypoint