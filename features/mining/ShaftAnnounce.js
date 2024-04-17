import settings from "../../utils/settings";
import { getClosest } from "../../utils/functions/find";
import { getInParty, getIsLeader } from "../../utils/party";
import { registerWhen } from "../../utils/variables";
import { getWorld } from "../../utils/worlds";
import { delay } from "../../utils/thread";
import { AQUA, GREEN, STAND_CLASS } from "../../utils/constants";


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
        if (getIsLeader() || index > 4) return;
        ChatLib.command(`pc ${TRANSFER_COMMANDS[index]}`);
        attemptTransfer(index + 1);
    }, 420);
}

registerWhen(register("chat", () => {
    if (!getInParty()) return;
    Client.showTitle(`${AQUA}Glacite Mineshaft!`, `${GREEN}Attempting transfer commands...`, 10, 50, 10);
    attemptTransfer(0);
}).setCriteria("WOW! You found a Glacite Mineshaft portal!"), () => settings.shaftTransfer && getWorld() === "Dwarven Mines");


/**
 * Corpse Announce
 */
let corpses = [];
let tung = 0;
let umb = 0;
let skele = 0;

function updateKeys() {
    const inventory = Player.getInventory().getItems();
    tung = inventory.find(item => item?.getName() === "§5Tungsten Key")?.getStackSize() ?? 0;
    umb = inventory.find(item => item?.getName() === "§5Umber Key")?.getStackSize() ?? 0;
    skele = inventory.find(item => item?.getName() === "§6Skeleton Key")?.getStackSize() ?? 0;
}

register("chat", () => {
    delay(updateKeys, 3000);
}).setCriteria(" ⛏ ${player} entered the mineshaft!");

function announceCorpse(corpseType) {
    if (!getInParty()) return;
    const x = Math.round(Player.getX());
    const y = Math.round(Player.getY());
    const z = Math.round(Player.getZ());

    // Determine corpse type
    Client.scheduleTask(4, () => {
        if (getClosest([x, y, z], corpses)[1] < 10) return;
        if (corpseType === undefined) {
            let tungsten = tung;
            let umber = umb;
            let skeleton = skele;
            updateKeys();
            corpseType = tungsten > tung ? "Tungsten" :
                umber > umb ? "Umber" :
                skeleton > skele ? "Vanguard" : "Lapis";
        }
        ChatLib.command(`pc x: ${x}, y: ${y}, z: ${z} | ${corpseType} Corpse!`);
    });
}

let looted = [];
registerWhen(register("chat", () => {
    looted.push([Player.getX(), Player.getY(), Player.getZ()]);
    if (settings.corpseAnnounce) announceCorpse();
}).setCriteria("  FROZEN CORPSE LOOT! "), () => (settings.corpseAnnounce || settings.corpseWaypoints) && getWorld() === "Mineshaft");
registerWhen(register("chat", () => {
    announceCorpse("Tungsten");
}).setCriteria("You need to be holding a Tungsten Key to unlock this corpse!"), () => settings.corpseAnnounce && getWorld() === "Mineshaft");
registerWhen(register("chat", () => {
    announceCorpse("Umber");
}).setCriteria("You need to be holding an Umber Key to unlock this corpse!"), () => settings.corpseAnnounce && getWorld() === "Mineshaft");
registerWhen(register("chat", () => {
    announceCorpse("Vanguard");
}).setCriteria("You need to be holding a Skeleton Key to unlock this corpse!"), () => settings.corpseAnnounce && getWorld() === "Mineshaft");

registerWhen(register("chat", (_, x, y, z) => {
    corpses.push([x, y, z.split(' ')[0]]);
}).setCriteria("${player}: x: ${x}, y: ${y}, z: ${z}"), () => settings.corpseAnnounce && getWorld() === "Mineshaft");

register("worldUnload", () => {
    corpses = [];
    looted = [];
});


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
            const type = helmet.func_82833_r().removeFormatting().split(' ')[0];  // getDisplayName
            if (!(type in corpseWaypoints)) return;
            
            const corpsePos = [ARMOR_MATCH[type], stand.getX(), stand.getY() + 2, stand.getZ()];
            if (getClosest(corpsePos, looted)[1] < 10) return;
            corpseWaypoints[type].push([ARMOR_MATCH[type], stand.getX(), stand.getY() + 2, stand.getZ()]);
        }
    });
}).setDelay(1), () => settings.corpseWaypoints && getWorld() === "Mineshaft");

register("worldUnload", () => {
    corpseWaypoints = {
        "Lapis": [],
        "Mineral": [],
        "Yog": [],
        "Vanguard": []
    };
});
