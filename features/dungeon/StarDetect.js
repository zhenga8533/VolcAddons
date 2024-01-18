import RenderLib from "../../../RenderLib";
import { EntityArmorStand, EntityWither } from "../../utils/constants";
import settings from "../../utils/settings";
import { data, registerWhen } from "../../utils/variables";
import { Hitbox } from "../../utils/waypoints";
import { getWorld } from "../../utils/worlds";


/**
 * Variables used to detect and store star mob data.
 */
let starMobs = {};

/**
 * Scans and stores all starred mob in world every half second.
 */
registerWhen(register("step", () => {
    starMobs = {};
    const stands = World.getAllEntitiesOfType(EntityArmorStand.class);

    stands.forEach(stand => {
        if (!stand.getName().startsWith("§6✯")) return;
        const standEntity = stand.getEntity();

        // Find closest mob
        const closestEntity = World.getWorld().func_72839_b(standEntity, standEntity.func_174813_aQ().func_72314_b(1, 5, 1))
        .filter(entity => {
            return entity &&
                !(entity instanceof EntityArmorStand) &&
                !(entity instanceof EntityWither) &&
                entity !== Player.getPlayer();
        })
        .reduce((closest, entity) => {
            const distance = stand.distanceTo(entity);
            return distance < closest.distance ? { entity, distance } : closest;
        }, { entity: undefined, distance: 20 });

        if (closestEntity.entity)starMobs[closestEntity.entity.func_145782_y()] = closestEntity.entity;
    });
}).setFps(2), () => getWorld() === "Catacombs" && settings.starDetect !== 0);

/**
 * Rendering for box and outline of star mobs.
 */
new Hitbox(() => getWorld() === "Catacombs" && (settings.starDetect === 2 || settings.starDetect === 3), () => {
    const c = settings.starColor;
    Object.keys(starMobs).forEach(key => {
        // Check dead
        const mob = starMobs[key];
        try { if (mob.func_110143_aJ() == 0) return; }
        catch (err) { return }

        // Render Box
        const x = mob.field_70142_S;
        const y = mob.field_70137_T;
        const z = mob.field_70136_U;
        const width = mob.field_70130_N * 1.5;
        const height =  mob.field_70131_O * 1.2;
        RenderLib.drawEspBox(x, y, z, width, height, c.getRed()/255, c.getGreen()/255, c.getBlue()/255, 1, data.vision);
        if (settings.starDetect === 2)
            RenderLib.drawInnerEspBox(x, y, z, width, height, c.getRed()/255, c.getGreen()/255, c.getBlue()/255, 0.5, data.vision);
    });
});

/**
 * Rendering for colored star mobs.
 */
registerWhen(register("renderEntity", (entity) => {
    if (!starMobs.hasOwnProperty(entity.getEntity().func_145782_y())) return;
    const c = settings.starColor;
    Tessellator.colorize(c.getRed()/255, c.getGreen()/255, c.getBlue()/255, 1);
}), () => getWorld() === "Catacombs" && settings.starDetect === 1);
