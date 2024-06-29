import { STAND_CLASS } from "../../utils/Constants";
import location from "../../utils/Location";
import party from "../../utils/Party";
import { registerWhen } from "../../utils/RegisterTils";
import Settings from "../../utils/Settings";
import { delay } from "../../utils/ThreadTils";
import Waypoint from "../../utils/Waypoint";
import { getClosest } from "../../utils/functions/find";
import { convertToTitleCase } from "../../utils/functions/format";

/**
 * Shaft Transfer
 */
const TRANSFER_COMMANDS = ["?transfer", "!ptme", "!pt", ".transfer", "Mineshaft, I found. Transfer party, you will."];

/**
 * Recursively calls party chat transfer commands until player becomes leader.
 *
 * @param {Number} index - Index in TRANSFER_COMMANDS.
 */
function attemptTransfer(index) {
  delay(() => {
    if (party.getLeader() || index >= TRANSFER_COMMANDS.length) return;
    ChatLib.command(`pc ${TRANSFER_COMMANDS[index]}`);
    attemptTransfer(index + 1);
  }, 420);
}

registerWhen(
  register("chat", () => {
    if (!party.getIn()) return;
    attemptTransfer(0);
  }).setCriteria("WOW! You found a Glacite Mineshaft portal!"),
  () => Settings.shaftTransfer && location.getWorld() === "Dwarven Mines"
);

/**
 * Corpse Announce
 */
let corpses = [];
let looted = [];
register("worldUnload", () => {
  corpses = [];
  looted = [];
});

register("chat", () => {
  delay(updateKeys, 3000);
}).setCriteria(" ⛏ ${player} entered the mineshaft!");

function announceCorpse(corpseType) {
  if (!party.getIn()) return;
  const x = Math.round(Player.getX());
  const y = Math.round(Player.getY());
  const z = Math.round(Player.getZ());

  // Determine corpse type
  if (getClosest([x, y, z], corpses)[1] < 10) return;
  ChatLib.command(`pc x: ${x}, y: ${y}, z: ${z} | ${corpseType} Corpse!`);
}

registerWhen(
  register("chat", (type) => {
    looted.push([Player.getX(), Player.getY(), Player.getZ()]);
    if (Settings.corpseAnnounce) announceCorpse(convertToTitleCase(type));
  }).setCriteria("  ${type} CORPSE LOOT! "),
  () => (Settings.corpseAnnounce || Settings.corpseWaypoints) && location.getWorld() === "Mineshaft"
);
registerWhen(
  register("chat", () => {
    announceCorpse("Tungsten");
  }).setCriteria("You need to be holding a Tungsten Key to unlock this corpse!"),
  () => Settings.corpseAnnounce && location.getWorld() === "Mineshaft"
);
registerWhen(
  register("chat", () => {
    announceCorpse("Umber");
  }).setCriteria("You need to be holding an Umber Key to unlock this corpse!"),
  () => Settings.corpseAnnounce && location.getWorld() === "Mineshaft"
);
registerWhen(
  register("chat", () => {
    announceCorpse("Vanguard");
  }).setCriteria("You need to be holding a Skeleton Key to unlock this corpse!"),
  () => Settings.corpseAnnounce && location.getWorld() === "Mineshaft"
);

registerWhen(
  register("chat", (_, x, y, z) => {
    corpses.push([x, y, z.split(" ")[0]]);
  }).setCriteria("${player}: x: ${x}, y: ${y}, z: ${z}"),
  () => Settings.corpseAnnounce && location.getWorld() === "Mineshaft"
);

/**
 * Corpse detection
 */
const ARMOR_MATCH = {
  Lapis: "Lapis",
  Mineral: "Tungsten",
  Yog: "Umber",
  Vanguard: "Vanguard",
};
const CORPSE_COLORS = {
  Lapis: [0.15, 0.38, 0.61],
  Mineral: [0.84, 0.82, 0.77],
  Yog: [1, 0.65, 0],
  Vanguard: [0, 1, 1],
};
const corpseWaypoints = new Waypoint();

registerWhen(
  register("step", () => {
    const stands = World.getAllEntitiesOfType(STAND_CLASS);
    corpseWaypoints.clear();

    stands.forEach((stand) => {
      const helmet = stand.getEntity()?.func_71124_b(4); // getEquipmentInSlot(0: Tool in Hand; 1-4: Armor)
      if (helmet !== null) {
        const type = helmet.func_82833_r().removeFormatting().split(" ")[0]; // getDisplayName for ItemStack
        if (!(type in CORPSE_COLORS)) return;

        const corpsePos = [ARMOR_MATCH[type], stand.getX(), stand.getY() + 1, stand.getZ()];
        if (getClosest(corpsePos, looted)[1] < 10) return;

        const color = CORPSE_COLORS[type];
        corpseWaypoints.push([...color, ...corpsePos]);
      }
    });
  }).setDelay(1),
  () => Settings.corpseWaypoints && location.getWorld() === "Mineshaft"
);
