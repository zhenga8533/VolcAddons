import { convertToPascalCase, unformatNumber } from "../../utils/functions";
import { data } from "../../utils/variables";

let entityList = [];
let entities = [];
export function getEntities() { return entities };

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
