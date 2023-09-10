import settings from "../../utils/settings";
import { AMOGUS, BOLD, GRAY, DARK_RED, GREEN, RED, WHITE } from "../../utils/constants";
import { convertToPascalCase, getTime, playSound, unformatNumber } from "../../utils/functions";
import { Overlay } from "../../utils/overlay";
import { data, registerWhen } from "../../utils/variables";
import { getServer, getWorld } from "../../utils/worlds";


/**
 * Variables used to track active entities.
 */
let colorMap = {};
let entityList = [];
let entities = [];
export function getEntities() { return entities };
let x = 0;
let y = 0;

/**
 * Identifies entity class based on name and adds to list with associated HP value.
 *
 * @param {string} entity - Entity name to test class for.
 * @param {number} HP - Associated HP value.
 * @returns {boolean} - True if entity class is identified and added to the list.
 */
function testClass(entity, HP) {
    try {
        mob = Java.type(entity).class;
        World.getAllEntitiesOfType(mob);
        entityList.push([mob, HP]);
        colorMap[mob.toString() + HP] = [Math.random(), Math.random(), Math.random()];
        return true;
    } catch(err) {
        return false;
    }
}

/**
 * Updates entity list based on mob data, processing HP and class information.
 */
export function updateEntityList() {
    colorMap = {};
    entityList = [];
    entities = [];
    x = 0;
    y = 0;

    data.moblist.forEach(mob => {
        const args = mob.split(' ');
        const HP = unformatNumber(args.pop());
        const PascalCaseMob = convertToPascalCase(HP === 0 ? mob : args.join(' '));
        
        if (PascalCaseMob === "OtherPlayerMP" && testClass(`net.minecraft.client.entity.Entity${PascalCaseMob}`, HP)) return;
        else if (testClass(`net.minecraft.entity.monster.Entity${PascalCaseMob}`, HP)) return;
        else if (testClass(`net.minecraft.entity.boss.Entity${PascalCaseMob}`, HP)) return;
        else if (testClass(`net.minecraft.entity.passive.Entity${PascalCaseMob}`, HP)) return;
        else {
            const remaining = parseInt(mob.substring(1));
            if (isNaN(remaining)) return;
            const front = mob[0].toLowerCase();
            if (front === 'x') x = remaining;
            else if (front === 'y') y = remaining;
        }
    });
}
updateEntityList();

/**
 * Creates colored entity list from entity data in `entityList`.
 * Determines color based on class and filters by HP if applicable.
 */
let SMA = Java.type('net.minecraft.entity.SharedMonsterAttributes');
registerWhen(register("tick", () =>{
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
        entities.push([[...filteredEntities], color]);
    });
}), () => entityList.length !== 0);


/**
 * Broodmother detection.
 */
const SPIDER_CLASS = Java.type("net.minecraft.entity.monster.EntitySpider").class;
let nextSpawn = 0;
const broodmotherExample = `${GRAY}${BOLD}Next Spawn: ${RED}???`;
const broodmotherOverlay = new Overlay("broodmotherDetect", ["Spider's Den"], () => true, data.DL, "moveBrood", broodmotherExample);
const broodLobbies = {};
registerWhen(register("step", () => {
    const server = getServer();
    if (nextSpawn === 0) {
        nextSpawn = broodLobbies[server] ?? 0;
        const broodmother = World.getAllEntitiesOfType(SPIDER_CLASS)
            .find(spider => spider.getEntity().func_110148_a(SMA.field_111267_a).func_111125_b() === 6_000 && spider.getY() > 150);
        if (broodmother === undefined) return;
        Client.Companion.showTitle(`${DARK_RED}${BOLD}Broodmother Spawned!`, "", 0, 25, 5);
        playSound(AMOGUS, 10000);
        nextSpawn = 600;
    } else {
        nextSpawn--;
        if (nextSpawn === 0) {
            broodmotherOverlay.message = `${GRAY}${BOLD}Next Spawn: ${GREEN}Soon TM`;
            Client.Companion.showTitle("", `${RED}Broodmother Spawning Soon!`, 0, 25, 5);
            if (server in broodLobbies) delete broodLobbies[server];
        } else broodmotherOverlay.message = `${GRAY}${BOLD}Next Spawn: ${WHITE}${getTime(nextSpawn)}`;
    }
}).setFps(1), () => settings.broodmotherDetect);

/**
 * World timer of world leave.
 */
registerWhen(register("worldUnload", () => {
    broodLobbies[getServer()] = nextSpawn;
    nextSpawn = 0;
    broodmotherOverlay.message = `${GRAY}${BOLD}Next Spawn: ${RED}???`;
}), () => getWorld() === "Spider's Den" && settings.broodmotherDetect);
