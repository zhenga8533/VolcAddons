import { EntityArmorStand, SMA, STAND_CLASS } from "../../utils/Constants";
import { data } from "../../utils/Data";
import { registerWhen } from "../../utils/RegisterTils";
import Settings from "../../utils/Settings";
import Waypoint from "../../utils/Waypoint";
import { convertToPascalCase, unformatNumber } from "../../utils/functions/format";

/**
 * Variables used to track active entities.
 */
const USED = new Set(["vanquisher", "jawbus", "thunder", "inquisitor"]);
const entityWaypoints = {};
const standWaypoints = {};
let xBound = 0;
let yBound = 0;

/**
 * Identifies entity class based on name and adds to list with associated HP value.
 *
 * @param {String} entity - Entity name to test class for.
 * @param {Number} health - Associated HP value.
 * @param {Number} index - Index of class type to test.
 * @returns {Boolean} - True if entity class is identified and added to the list.
 */
const CLASS_TYPES = ["client.entity", "entity.monster", "entity.boss", "entity.passive"];
function testClass(entity, health, index = 0) {
  // Set color map
  const [uR, uG, uB] = data.colorlist[entity]?.split(" ") ?? [];
  const rgb = Settings.hitboxColor;
  const r = (isNaN(uR) ? Math.random() * (255 - rgb.blue) : uR) / 255;
  const g = (isNaN(uG) ? Math.random() * (255 - rgb.red) : uG) / 255;
  const b = (isNaN(uB) ? Math.random() * (255 - rgb.green) : uB) / 255;

  try {
    const type = `net.minecraft.${CLASS_TYPES[index]}.Entity${entity}`;
    const entityClass = Java.type(type).class;
    World.getAllEntitiesOfType(entityClass);

    entityWaypoints[entity] = [new Waypoint([r, g, b], 3, true, false, false), entityClass, health];
    return true;
  } catch (err) {
    if (index === CLASS_TYPES.length - 1) {
      standWaypoints[entity] = new Waypoint([r, g, b], 3, true, false, false);
      return false;
    }

    return testClass(entity, health, index + 1);
  }
}

/**
 * Updates entity list based on mob data, processing HP and class information.
 */
export function updateEntityList() {
  // Reset entity list
  xBound = 0;
  yBound = 0;
  Object.keys(entityWaypoints).forEach((entity) => {
    entityWaypoints[entity][0].delete();
    delete entityWaypoints[entity];
  });
  Object.keys(standWaypoints).forEach((stand) => {
    standWaypoints[stand].delete();
    delete standWaypoints[stand];
  });

  // Update moblist objects
  data.moblist.forEach((mob) => {
    const args = mob.split(" ");
    const health = unformatNumber(args.pop());
    const entity = convertToPascalCase(health === 0 ? mob : args.join(" "));

    if (!USED.has(mob) && !testClass(entity, health)) {
      // Check for bounds otherwise set as armor stand detection
      const remaining = parseInt(mob.substring(1));
      if (isNaN(remaining)) return;

      const front = mob[0].toLowerCase();
      if (front === "x") xBound = remaining;
      else if (front === "y") yBound = remaining;
    }
  });
}
updateEntityList();

/**
 * Creates colored entity list from entity data in `entityList`.
 * Determines color based on class and filters by HP if applicable.
 */
registerWhen(
  register("step", () => {
    // Refresh entities every 0.5s
    Object.keys(entityWaypoints).forEach((entity) => {
      // Match coloring
      const entityWaypoint = entityWaypoints[entity][0];
      const entityClass = entityWaypoints[entity][1];
      const health = entityWaypoints[entity][2];
      entityWaypoint.clear();

      // Add entities
      World.getAllEntitiesOfType(entityClass).forEach((entity) => {
        const mob = entity.getEntity();
        if (
          (health !== 0 && mob.func_110148_a(SMA.field_111267_a).func_111125_b() !== health) ||
          (xBound !== 0 && Math.abs(Player.getX() - entity.getX()) > xBound) ||
          (yBound !== 0 && Math.abs(Player.getY() - entity.getY()) > yBound) ||
          mob.func_110143_aJ() === 0
        )
          return;

        entityWaypoint.push(["", entity]);
      });
    });

    // Refresh stands every 0.5s
    const keys = Object.keys(standWaypoints);
    keys.forEach((key) => standWaypoints[key].clear());
    if (keys.length === 0) return;

    World.getAllEntitiesOfType(STAND_CLASS).forEach((stand) => {
      keys.forEach((key) => {
        if (stand.getName().includes(key)) {
          // Find closest entity to armor stand
          const standEntity = stand.getEntity();
          const closestEntity = World.getWorld()
            .func_72839_b(standEntity, standEntity.func_174813_aQ().func_72314_b(1, 5, 1))
            .filter((entity) => entity && !(entity instanceof EntityArmorStand) && entity !== Player.getPlayer())
            .reduce(
              (closest, entity) => {
                const distance = stand.distanceTo(entity);
                return distance < closest.distance ? { entity, distance } : closest;
              },
              { entity: standEntity, distance: 20 }
            );

          if (!closestEntity) return;
          standWaypoints[key].push(["", closestEntity.entity]);
        }
      });
    });
  }).setFps(2),
  () => Object.keys(entityWaypoints).length > 0
);
