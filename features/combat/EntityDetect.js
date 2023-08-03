import { convertToPascalCase } from "../../utils/functions";
import { data } from "../../utils/variables";

let entityList = [];
let entities = [];
export function getEntities() { return entities };

function testClass(entity) {
    try {
        mob = Java.type(entity).class;
        World.getAllEntitiesOfType(mob);
        entityList.push(mob);
    } catch(err) {}
}
export function updateEntityList() {
    entityList = [];

    data.moblist.forEach(mob => { testClass(`net.minecraft.entity.monster.Entity${convertToPascalCase(mob)}`) });
    data.moblist.forEach(boss => { testClass(`net.minecraft.entity.boss.Entity${convertToPascalCase(boss)}`) });
    data.moblist.forEach(passive => { testClass(`net.minecraft.entity.passive.Entity${convertToPascalCase(passive)}`) });
}
updateEntityList();

register("tick", () =>{
    entities = [];
    entityList.forEach(entityClass => {
        World.getAllEntitiesOfType(entityClass).forEach(entity => {
            entities.push(entity);
        });
    });
});
