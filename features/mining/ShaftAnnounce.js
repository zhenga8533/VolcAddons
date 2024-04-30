import location from "../../utils/location";
import settings from "../../utils/settings";
import { STAND_CLASS } from "../../utils/constants";
import { getClosest } from "../../utils/functions/find";
import { convertToTitleCase } from "../../utils/functions/format";
import { getInParty, getIsLeader } from "../../utils/party";
import { registerWhen } from "../../utils/register";
import { delay } from "../../utils/thread";


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
        if (getIsLeader() || index >= TRANSFER_COMMANDS.length) return;
        ChatLib.command(`pc ${TRANSFER_COMMANDS[index]}`);
        attemptTransfer(index + 1);
    }, 420);
}

registerWhen(register("chat", () => {
    if (!getInParty()) return;
    attemptTransfer(0);
}).setCriteria("WOW! You found a Glacite Mineshaft portal!"), () => settings.shaftTransfer && location.getWorld() === "Dwarven Mines");


/**
 * Corpse Announce
 */
let corpses = [];

register("chat", () => {
    delay(updateKeys, 3000);
}).setCriteria(" ⛏ ${player} entered the mineshaft!");

function announceCorpse(corpseType) {
    if (!getInParty()) return;
    const x = Math.round(Player.getX());
    const y = Math.round(Player.getY());
    const z = Math.round(Player.getZ());

    // Determine corpse type
    if (getClosest([x, y, z], corpses)[1] < 10) return;
    ChatLib.command(`pc x: ${x}, y: ${y}, z: ${z} | ${corpseType} Corpse!`);
}

let looted = [];
registerWhen(register("chat", (type) => {
    looted.push([Player.getX(), Player.getY(), Player.getZ()]);
    if (settings.corpseAnnounce) announceCorpse(convertToTitleCase(type));
}).setCriteria("  ${type} CORPSE LOOT! "), () => (settings.corpseAnnounce || settings.corpseWaypoints) && location.getWorld() === "Mineshaft");
registerWhen(register("chat", () => {
    announceCorpse("Tungsten");
}).setCriteria("You need to be holding a Tungsten Key to unlock this corpse!"), () => settings.corpseAnnounce && location.getWorld() === "Mineshaft");
registerWhen(register("chat", () => {
    announceCorpse("Umber");
}).setCriteria("You need to be holding an Umber Key to unlock this corpse!"), () => settings.corpseAnnounce && location.getWorld() === "Mineshaft");
registerWhen(register("chat", () => {
    announceCorpse("Vanguard");
}).setCriteria("You need to be holding a Skeleton Key to unlock this corpse!"), () => settings.corpseAnnounce && location.getWorld() === "Mineshaft");

registerWhen(register("chat", (_, x, y, z) => {
    corpses.push([x, y, z.split(' ')[0]]);
}).setCriteria("${player}: x: ${x}, y: ${y}, z: ${z}"), () => settings.corpseAnnounce && location.getWorld() === "Mineshaft");

/**
 * Corpse detection 
 */
const ARMOR_MATCH = {
    "Lapis": "Lapis",
    "Mineral": "Tungsten",
    "Yog": "Umber",
    "Vanguard": "Vanguard"
};
let corpseWaypoints = {
    "Lapis": [],
    "Mineral": [],
    "Yog": [],
    "Vanguard": []
};
export function getCorpses() { return corpseWaypoints };

registerWhen(register("step", () => {
    const stands = World.getAllEntitiesOfType(STAND_CLASS);
    corpseWaypoints = {
        "Lapis": [],
        "Mineral": [],
        "Yog": [],
        "Vanguard": []
    };

    stands.forEach(stand => {
        const helmet = stand.getEntity()?.func_71124_b(4);  // getEquipmentInSlot(0: Tool in Hand; 1-4: Armor)
        if (helmet !== null) {
            const type = helmet.func_82833_r().removeFormatting().split(' ')[0];  // getDisplayName for ItemStack
            if (!(type in corpseWaypoints)) return;

            const corpsePos = [ARMOR_MATCH[type], stand.getX(), stand.getY() + 2, stand.getZ()];
            if (getClosest(corpsePos, looted)[1] < 10) return;
            corpseWaypoints[type].push([ARMOR_MATCH[type], stand.getX(), stand.getY() + 2, stand.getZ()]);
        }
    });
}).setDelay(1), () => settings.corpseWaypoints && location.getWorld() === "Mineshaft");

register("worldUnload", () => {
    corpses = [];
    looted = [];
    corpseWaypoints = {
        "Lapis": [],
        "Mineral": [],
        "Yog": [],
        "Vanguard": []
    };
});
