import location from "../../utils/location";
import settings from "../../utils/settings";
import { EntityArmorStand, EntityWither } from "../../utils/constants";
import { registerWhen } from "../../utils/register";
import { Waypoint } from "../../utils/WaypointUtil";


/**
 * Variables used to detect and store star mob data.
 */
const starMobs = new Waypoint([0, 0, 0], 3, settings.starDetect === 2, false, false);
const starHighlight = new Set();

/**
 * Sets the color and box of the star mobs.
 */
function setStar() {
    const c = settings.starColor;
    starMobs.setBox(settings.starDetect === 2);
    starMobs.setColor([c.getRed()/255, c.getGreen()/255, c.getBlue()/255]);
}
setStar();

register("guiClosed", (event) => {
    if (!event.toString().startsWith("gg.essential.vigilance.gui.SettingsGui")) return;
    setStar();
});

/**
 * Scans and stores all starred mob in world every half second.
 */
registerWhen(register("step", () => {
    starMobs.clear();
    starHighlight.clear();
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

        if (closestEntity.entity) {
            starMobs.push([stand.getName(), closestEntity.entity]);
            starHighlight.add(closestEntity.entity?.func_145782_y());
        }
    });
}).setFps(2), () => location.getWorld() === "Catacombs" && settings.starDetect !== 0);

/**
 * Rendering for colored star mobs.
 */
registerWhen(register("renderEntity", (entity) => {
    if (!starHighlight.has(entity.getEntity().func_145782_y())) return;
    const c = settings.starColor;
    Tessellator.colorize(c.getRed()/255, c.getGreen()/255, c.getBlue()/255, 1);
}), () => location.getWorld() === "Catacombs" && settings.starDetect === 1);
