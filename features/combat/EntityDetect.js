import settings from "../../utils/settings";
import { AMOGUS, BOLD, GRAY, DARK_RED, GREEN, RED, WHITE, SMA, SPIDER_CLASS, EntityArmorStand } from "../../utils/constants";
import { convertToPascalCase, getTime, unformatNumber } from "../../utils/functions/format";
import { playSound } from "../../utils/functions/misc";
import { Overlay } from "../../utils/overlay";
import { data, registerWhen } from "../../utils/variables";
import { getServer, getWorld } from "../../utils/worlds";
import { Hitbox, renderEntities } from "../../utils/waypoints";


/**
 * Variables used to track active entities.
 */
const USED = new Set(["vanquisher", "jawbus", "thunder"]);
let colorMap = {};
let entityList = [];
let entities = [];
let standList = [];
let x = 0;
let y = 0;

/**
 * Identifies entity class based on name and adds to list with associated HP value.
 *
 * @param {String} entity - Entity name to test class for.
 * @param {Number} HP - Associated HP value.
 * @returns {Boolean} - True if entity class is identified and added to the list.
 */
const CLASS_TYPES = ["client.entity", "entity.monster", "entity.boss", "entity.passive"];
function testClass(entity, HP, index) {
    try {
        const type = `net.minecraft.${CLASS_TYPES[index]}.Entity${entity}`;
        const mob = Java.type(type).class;
        World.getAllEntitiesOfType(mob);
        
        // Set color map
        const [uR, uG, uB] = data.colorlist[entity]?.split(' ') ?? [];
        const rgb = settings.hitboxColor;
        const r = isNaN(uR) ? Math.random() * (255 - rgb.blue) : uR;
        const g = isNaN(uG) ? Math.random() * (255 - rgb.red) : uG;
        const b = isNaN(uB) ? Math.random() * (255 - rgb.green) : uB;
        colorMap[mob.toString() + HP] = [r / 255, g / 255, b / 255];

        entityList.push([mob, HP]);
        return true;
    } catch(err) {
        if (index === CLASS_TYPES.length) return;
        return testClass(entity, HP, index + 1);
    }
}

/**
 * Updates entity list based on mob data, processing HP and class information.
 */
export function updateEntityList() {
    colorMap = {};
    entityList = [];
    entities = [];
    standList = [];
    x = 0;
    y = 0;

    // Update moblist objects
    data.moblist.forEach(mob => {
        const args = mob.split(' ');
        const HP = unformatNumber(args.pop());
        const PascalCaseMob = convertToPascalCase(HP === 0 ? mob : args.join(' '));
        
        if (!testClass(PascalCaseMob, HP, 0) && !USED.has(mob)) {
            // Check for bounds otherwise set as armor stand detection
            const remaining = parseInt(mob.substring(1));

            // Set armor stand names if not bound number
            if (isNaN(remaining)) {
                const rgb = settings.hitboxColor;
                const r = Math.random() * (255 - rgb.blue);
                const g = Math.random() * (255 - rgb.red);
                const b = Math.random() * (255 - rgb.green);
                colorMap[mob] = [r / 255, g / 255, b / 255];

                standList.push(mob);
                return;
            }

            // Set bounds
            const front = mob[0].toLowerCase();
            if (front === 'x') x = remaining;
            else if (front === 'y') y = remaining;
        }
    });

    // Update primal fear highlight
    if (settings.fearHighlight) {
        const rgb = settings.hitboxColor;
        const r = Math.random() * (255 - rgb.blue);
        const g = Math.random() * (255 - rgb.red);
        const b = Math.random() * (255 - rgb.green);
        colorMap["§c☠"] = [r / 255, g / 255, b / 255];

        standList.push("§c☠");
    }
}
updateEntityList();

/**
 * Creates colored entity list from entity data in `entityList`.
 * Determines color based on class and filters by HP if applicable.
 */
const STAND_CLASS = EntityArmorStand.class;
registerWhen(register("step", () => {
    // Refresh entities every 0.5s
    entities = [];
    entityList.forEach(entityData => {
        // Match coloring
        const entityClass = entityData[0];
        const entityHp = entityData[1];
        const color = colorMap[entityClass.toString() + entityHp];
        
        // Add entities
        const livingEntities = World.getAllEntitiesOfType(entityClass).filter(entity => entity.getEntity().func_110143_aJ() != 0);
        let filteredEntities = entityHp === 0 ? livingEntities :
            livingEntities.filter(entity => entity.getEntity().func_110148_a(SMA.field_111267_a).func_111125_b() === entityHp);
        if (x !== 0) filteredEntities = filteredEntities.filter(entity => Math.abs(Player.getX() - entity.getX()) <= x);
        if (y !== 0) filteredEntities = filteredEntities.filter(entity => Math.abs(Player.getY() - entity.getY()) <= y);
        if (filteredEntities.length === 0) return;
        entities.push([filteredEntities, color]);
    });

    // Refresh stands every 0.5s
    if (standList.length === 0) return;
    const stands = {};
    World.getAllEntitiesOfType(STAND_CLASS).forEach(stand => {
        standList.forEach(name => {
            if (stand.getName().includes(name)) {
                // Find closest entity to armor stand
                const standEntity = stand.getEntity();

                const closestEntity = World.getWorld().func_72839_b(standEntity, standEntity.func_174813_aQ().func_72314_b(1, 5, 1))
                .filter(entity => entity && !(entity instanceof EntityArmorStand) && entity !== Player.getPlayer())
                .reduce((closest, entity) => {
                    const distance = stand.distanceTo(entity);
                    return distance < closest.distance ? { entity, distance } : closest;
                }, { entity: standEntity, distance: 20 });

                // put into stands object
                stands[name] = stands[name] ?? [];
                stands[name].push(closestEntity.entity);
            }
        });
    });

    for (let stand in stands) entities.push([stands[stand], colorMap[stand]]);
}).setFps(2), () => entityList.length !== 0 || standList.length !== 0);

/**
 * Register hitbox rendering
 */
new Hitbox(() => entityList.length !== 0 || standList.length !== 0, (pt) => {
    entities.forEach(entity => {
        const color = entity[1];
        renderEntities(entity[0], color[0], color[1], color[2], pt);
    });
});


/**
 * Broodmother detection.
 */
let nextSpawn = 0;
const broodmotherExample = `${GRAY + BOLD}Next Spawn: ${RED}???`;
const broodmotherOverlay = new Overlay("broodmotherDetect", ["Spider's Den"], () => true, data.DL, "moveBrood", broodmotherExample);
const broodLobbies = {};
registerWhen(register("step", () => {
    const server = getServer();
    if (nextSpawn === 0) {
        nextSpawn = broodLobbies[server] ?? 0;
        const broodmother = World.getAllEntitiesOfType(SPIDER_CLASS)
            .find(spider => spider.getEntity().func_110148_a(SMA.field_111267_a).func_111125_b() === 6_000 && spider.getY() > 150);
        if (broodmother === undefined) return;
        Client.showTitle(`${DARK_RED + BOLD}Broodmother Spawned!`, "", 0, 25, 5);
        playSound(AMOGUS, 10000);
        nextSpawn = 600;
    } else {
        nextSpawn--;
        if (nextSpawn === 0) {
            broodmotherOverlay.message = `${GRAY + BOLD}Next Spawn: ${GREEN}Soon TM`;
            Client.showTitle("", `${RED}Broodmother Spawning Soon!`, 0, 25, 5);
            if (server in broodLobbies) delete broodLobbies[server];
        } else broodmotherOverlay.message = `${GRAY + BOLD}Next Spawn: ${WHITE + getTime(nextSpawn)}`;
    }
}).setFps(1), () => settings.broodmotherDetect);

/**
 * World timer of world leave.
 */
registerWhen(register("worldUnload", () => {
    broodLobbies[getServer()] = nextSpawn;
    nextSpawn = 0;
    broodmotherOverlay.message = `${GRAY + BOLD}Next Spawn: ${RED}???`;
}), () => getWorld() === "Spider's Den" && settings.broodmotherDetect);
