import { convertToPascalCase, unformatNumber } from "../../utils/functions";
import { data } from "../../utils/variables";


/**
 * Variables used to track active entities.
 */
let entityList = [];
let entities = [];
export function getEntities() { return entities };

/**
 * This function attempts to identify an entity class based on the provided entity name,
 * and if successful, adds the entity class and its associated HP value to a list.
 *
 * @param {string} entity - The name of the entity to test the class for.
 * @param {number} HP - The HP value associated with the entity.
 * @returns {boolean} - Returns true if the entity class is identified and added to the list,
 *                     otherwise returns false.
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
 * This function iterates through a list of mobs and their data to update the entity list.
 * For each mob, it processes the mob's HP and class, and adds them to the entity list
 * based on their class type using the `testClass` function.
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
 * This function processes the entity data in the `entityList` to create a list of colored entities.
 * For each entity, it determines the appropriate color based on its class and adds the entity
 * (with its color) to the `entities` list. The entities are filtered based on HP if applicable.
 */
register("tick", () =>{
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
        const filteredEntities = entityHp === 0 ? World.getAllEntitiesOfType(entityClass) :
            World.getAllEntitiesOfType(entityClass).filter(entity => entity.getEntity().func_110138_aP() === entityHp);
        if (filteredEntities.length === 0) return;
        entities.push([[...filteredEntities], color]);
    });
});
