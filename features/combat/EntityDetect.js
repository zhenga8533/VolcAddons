import { convertToPascalCase, unformatNumber } from "../../utils/functions";
import { data, registerWhen } from "../../utils/variables";


/**
 * Variables used to track active entities.
 */
let entityList = [];
let entities = [];
export function getEntities() { return entities };

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
        return true;
    } catch(err) {
        return false;
    }
}

/**
 * Updates entity list based on mob data, processing HP and class information.
 */
export function updateEntityList() {
    entityList = [];

    data.moblist.forEach(mob => {
        const args = mob.split(' ');
        const HP = unformatNumber(args.pop());
        const PascalCaseMob = convertToPascalCase(HP === 0 ? mob : args.join(' '));
        
        if (PascalCaseMob === "OtherPlayerMP" && testClass(`net.minecraft.client.entity.Entity${PascalCaseMob}`, HP)) return;
        else if (testClass(`net.minecraft.entity.monster.Entity${PascalCaseMob}`, HP)) return;
        else if (testClass(`net.minecraft.entity.boss.Entity${PascalCaseMob}`, HP)) return;
        else if (testClass(`net.minecraft.entity.passive.Entity${PascalCaseMob}`, HP)) return;
    });
}
updateEntityList();

/**
 * Creates colored entity list from entity data in `entityList`.
 * Determines color based on class and filters by HP if applicable.
 */
registerWhen(register("tick", () =>{
    entities = [];
    entityList.forEach(entityData => {
        // Match coloring
        const entityClass = entityData[0];
        const entityHp = entityData[1];
        const colorMap = {
            "monster": [1, 0, 0], // Red
            "boss": [0, 1, 0],    // Green
            "passive": [0, 0, 1], // Blue
        };
        const color = colorMap[Object.keys(colorMap).find(type => entityClass.toString().includes(type))] || [1, 1, 1];
        
        // Add entities
        const livingEntities = World.getAllEntitiesOfType(entityClass).filter(entity => entity.getEntity().func_110143_aJ() !== 0);
        const filteredEntities = entityHp === 0 ? livingEntities :
            World.getAllEntitiesOfType(entityClass).filter(entity => entity.getEntity().func_110138_aP() === entityHp);
        if (filteredEntities.length === 0) return;
        entities.push([[...filteredEntities], color]);
    });
}), () => entityList.length !== 0);
