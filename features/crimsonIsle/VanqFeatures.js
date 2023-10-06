import settings from "../../utils/settings";
import { AMOGUS, BOLD, DARK_PURPLE, RED, RESET, WHITE } from "../../utils/constants";
import { announceMob, playSound } from "../../utils/functions";
import { getInParty } from "../../utils/party";
import { delay } from "../../utils/thread";
import { Overlay } from "../../utils/overlay";
import { data, registerWhen } from "../../utils/variables";
import { findZone, getWorld } from "../../utils/worlds";
import { renderEntities } from "../../utils/waypoints";


/**
 * Variables used to track and display item and vanquisher kill counts.
 */
let items = {};
let session = {
    "vanqs": 0,
    "kills": 0,
    "last": 0,
    "average": 0,
};
const counterExample =
`${RED + BOLD}Total Vanqs: ${RESET}Xue
${RED + BOLD}Total Kills: ${RESET}Hua
${RED + BOLD}Kills Since: ${RESET}Piao
${RED + BOLD}Average Kills: ${RESET}Piao`;
const counterOverlay = new Overlay("vanqCounter", ["Crimson Isle"], () => true, data.CL, "moveCounter", counterExample);
counterOverlay.message = "";

/**
 * Uses the "Book of Stats" to track whenever player kills an entity and updates the Vanquisher Overlay.
 */
registerWhen(register("entityDeath", (death) => {
    if (Player.getHeldItem() === null) return;
    const registry = Player.getHeldItem().getRegistryName();
    if (!registry.endsWith("hoe") && !registry.endsWith("bow") && Player.asPlayerMP().distanceTo(death) > 16) return;

    Client.scheduleTask(1, () => {
        const ExtraAttributes = Player.getHeldItem().getNBT().getCompoundTag("tag").getCompoundTag("ExtraAttributes");
        const heldItem = ExtraAttributes.getString("id");
        const newKills = ExtraAttributes.getInteger("stats_book");

        if (!(heldItem in items)) {
            items[heldItem] = newKills;
            return;
        }

        killsDiff = Math.abs(newKills - items[heldItem]);

        if (killsDiff > 10) {  // In order for mobs in other islands to not count
            items[heldItem] = newKills;
            return;
        }

        // Overall
        data.vanqSession.kills += killsDiff;
        data.vanqSession.last += killsDiff;
        if (data.vanqSession.vanqs) data.vanqSession.average = Math.round(data.vanqSession.kills / data.vanqSession.vanqs);

        // Session
        session.kills += killsDiff;
        session.last += killsDiff;
        if (session.vanqs) session.average = Math.round(session.kills / session.vanqs);
        items[heldItem] = newKills;

        // Update HUD
        counterOverlay.message = settings.vanqCounter === 1 ?
`${RED + BOLD}Total Vanqs: ${RESET + data.vanqSession.vanqs}
${RED + BOLD}Total Kills: ${RESET + data.vanqSession.kills}
${RED + BOLD}Kills Since: ${RESET + data.vanqSession.last}
${RED + BOLD}Average Kills: ${RESET + data.vanqSession.average}`
:
`${RED + BOLD}Total Vanqs: ${RESET + session.vanqs}
${RED + BOLD}Total Kills: ${RESET + session.kills}
${RED + BOLD}Kills Since: ${RESET + session.last}
${RED + BOLD}Average Kills: ${RESET + session.average}`;
    });
}), () => getWorld() === "Crimson Isle" && settings.vanqCounter !== 0);

/**
 * Tracks whenever the player spawns a Vanquisher and updates the counter.
 */
registerWhen(register("chat", () => {
    // Overall
    data.vanqSession.vanqs++;
    data.vanqSession.average = (data.vanqSession.kills / data.vanqSession.vanqs);
    data.vanqSession.last = 0;
    
    // Session
    session.vanqs++;
    session.average = (session.kills / session.vanqs);
    session.last = 0;
}).setCriteria("A Vanquisher is spawning nearby!"), () => getWorld() === "Crimson Isle" && settings.vanqCounter !== 0);

/**
 * Command to reset the stats for the overall counter.
 */
register("command", () => {
    session = {
        "vanqs": 0,
        "kills": 0,
        "last": 0,
        "average": 0,
    };
    data.vanqSession = {
        "vanqs": 0,
        "kills": 0,
        "last": 0,
        "average": 0,
    };
}).setName("resetCounter");


/**
 * --- Vanquisher Detect ---
 * Vanquisher detection variables.
 */
const WITHER_CLASS = Java.type('net.minecraft.entity.boss.EntityWither').class;
let vanquishers = [];

/**
 * Announce vanquisher spawn on chat message appears.
 */
registerWhen(register("chat", () => {
    announceMob(settings.vanqAlert, "Vanquisher", Player.getX(), Player.getY(), Player.getZ());
}).setCriteria("A Vanquisher is spawning nearby!"), () => getWorld() === "Crimson Isle" && settings.vanqAlert !== 0);

/**
 * Alerts player when another VA user posts coords.
 */
registerWhen(register("chat", () => {
    playSound(AMOGUS, 10000);
}).setCriteria("${player}: ${coords} | Vanquisher Spawned at [${location}]!"), () => getWorld() === "Crimson Isle" && settings.vanqSound);

/**
 * Tracks world for any vanquishers near player.
 */
const vanqExample = `${DARK_PURPLE + BOLD}Vanquisher ${WHITE}Detected`;
const vanqOverlay = new Overlay("vanqDetect", ["Crimson Isle"], () => true, data.QL, "moveVanq", vanqExample);
vanqOverlay.message = "";
registerWhen(register("step", () => {
    vanquishers = World.getAllEntitiesOfType(WITHER_CLASS).filter(entity => entity.getEntity().func_110138_aP() === 1024);

    if (vanquishers.length > 0) {
        if (vanquishers.find(vanquisher => vanquisher.getEntity().func_110143_aJ() === 0) !== undefined)
            vanqOverlay.message = `${DARK_PURPLE + BOLD}Vanquisher ${RED}Dead!`;
        else vanqOverlay.message = vanqExample;
        
        if (settings.vanqSound)playSound(AMOGUS, 10000);
        if (!data.moblist.includes("vanquisher")) vanquishers = [];
    } else vanqOverlay.message = "";
}).setFps(2), () => getWorld() === "Crimson Isle" && settings.vanqDetect);
registerWhen(register("renderWorld", () => {
    renderEntities(vanquishers, 0.5, 0, 0.5);
}), () => getWorld() === "Crimson Isle" && settings.vanqDetect);
register("worldUnload", () => vanquishers = []);


/**
 * --- Vanquisher Warp ---
 * Variables used to track party and represent vanquisher spawn data.
 */
let vanqCoords = [0, 0, 0, "None"];
let vanqSpawned = false;
let notInParty = 0;

/**
 * Saves location data and invites every player in settings whenever player spawns a Vanquisher.
 */
registerWhen(register("chat", () => {
    if (vanqSpawned) return;

    vanqSpawned = true;
    notInParty = 0;

    // PLAYER POSITION
    vanqCoords[0] = Math.round(Player.getX());
    vanqCoords[1] = Math.round(Player.getY());
    vanqCoords[2] = Math.round(Player.getZ());
    vanqCoords[3] = findZone();

    // INVITE PARTY
    delay(() => { if (getInParty()) ChatLib.command("p leave") }, 500);

    let timeout = 1000
    settings.vanqParty.split(", ").forEach(ign => {
        delay(() => { ChatLib.command(`p ${ign}`) }, timeout);
        notInParty++;
        timeout += 500;
    });
}).setCriteria("A Vanquisher is spawning nearby!"), () => getWorld() === "Crimson Isle" && settings.vanqParty !== "");

/**
 * Tracks whenever a player joins/fails to join the party and warps party to lobby whenever all players have joined.
 */
function warpParty() {
    if (!vanqSpawned) return;

    notInParty--;
    if (notInParty <= 0 && getInParty()) {
        vanqSpawned = false;
        notInParty = 0;

        delay(() => { ChatLib.command('p warp') }, 500);
        delay(() => { ChatLib.command(`pc x: ${vanqCoords[0]}, y: ${vanqCoords[1]}, z: ${vanqCoords[2]} | Vanquisher Spawned at [${vanqCoords[3]} ]!`) }, 1000);
        delay(() => { ChatLib.command("p disband") }, 1500);
    }
}
registerWhen(register("chat", () => {
    delay(warpParty(), 500);
}).setCriteria("${player} joined the party."), () => getWorld() === "Crimson Isle" && settings.vanqParty !== "");
registerWhen(register("chat", () => {
    delay(warpParty(), 500);
}).setCriteria("The party invite to ${player} has expired"), () => getWorld() === "Crimson Isle" && settings.vanqParty !== "");

/**
 * Fail safe for whenever a player goes offline or player inputs invalid username.
 */
function noInvite() {
    if (!vanqSpawned) return;

    notInParty--;
    if (notInParty <= 0) {
        notInParty = 0;
        vanqSpawned = false;
    }
}
registerWhen(register("chat", () => {
    delay(noInvite(), 500);
}).setCriteria("Couldn't find a player with that name!"), () => getWorld() === "Crimson Isle" && settings.vanqParty !== "");
registerWhen(register("chat", () => {
    delay(noInvite(), 500);
}).setCriteria("You cannot invite that player since they're not online."), () => getWorld() === "Crimson Isle" && settings.vanqParty !== "");

/**
 * Fail safe in the event that two players spawn at same time or the Vanquisher you spawn dies before warp.
 */
registerWhen(register("chat", () => {
    vanqSpawned = false;
    notInParty = 0;
}).setCriteria("You have joined ${player} party!"), () => getWorld() === "Crimson Isle" && settings.vanqParty !== "");
registerWhen(register("chat", () => {
    vanqSpawned = false;
    notInParty = 0;
}).setCriteria("RARE DROP! Nether Star"), () => getWorld() === "Crimson Isle" && settings.vanqParty !== "");

