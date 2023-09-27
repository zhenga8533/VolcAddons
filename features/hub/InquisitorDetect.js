import settings from "../../utils/settings";
import { BOLD, GOLD, WHITE, RESET } from "../../utils/constants";
import { announceMob } from "../../utils/functions";
import { getPerks } from "../../utils/mayor";
import { Overlay } from "../../utils/overlay";
import { data, registerWhen } from "../../utils/variables";
import { getWorld } from "../../utils/worlds";
import { renderEntities } from "../../utils/waypoints";


/**
 * Inquisitor alert variables.
 */
const PLAYER_CLASS = Java.type("net.minecraft.client.entity.EntityOtherPlayerMP").class;
let inquisitor = undefined;

/**
 * Variables used to track and display Inquisitor counter.
 */
const session = {
    "inqs": 0,
    "burrows": 0,
    "last": 0,
    "average": 0,
};
const counterExample =
`${GOLD + BOLD}Total Inqs: ${RESET}Who.
${GOLD + BOLD}Total Burrows: ${RESET}Let.
${GOLD + BOLD}Burrows Since: ${RESET}Him.
${GOLD + BOLD}Average Burrows: ${RESET}Cook.`
const counterOverlay = new Overlay("inqCounter", ["Hub"], () => getPerks().has("Mythological Ritual"), data.IL, "moveInq", counterExample);

/**
 * Updates the inquisitor counter depending on if an inquisitor spawned.
 *
 * @param {boolean} inqSpawned - True if inquisitor spawned, false otherwise.
 */
export function updateInqCounter(inqSpawned) {
    // Overall
    data.inqSession.burrows++;
    data.inqSession.last++;
    if (inqSpawned) {
        data.inqSession.inqs++;
        data.inqSession.last = 0;
    }
    if (data.inqSession.inqs) data.inqSession.average = Math.round(data.inqSession.burrows / data.inqSession.inqs);

    // Session
    session.burrows++;
    session.last++;
    if (inqSpawned) {
        session.inqs++;
        session.last = 0;
    }
    if (session.inqs) session.average = Math.round(session.burrows / session.inqs);

    // Update HUD
    counterOverlay.message = settings.inqCounter === 1 ?
`${GOLD + BOLD}Total Inqs: ${RESET + data.inqSession.inqs}
${GOLD + BOLD}Total Burrows: ${RESET + data.inqSession.burrows}
${GOLD + BOLD}Burrows Since: ${RESET + data.inqSession.last}
${GOLD + BOLD}Average Burrows: ${RESET + data.inqSession.average}`
:
`${GOLD + BOLD}Total Inqs: ${RESET + session.inqs}
${GOLD + BOLD}Total Burrows: ${RESET + session.burrows}
${GOLD + BOLD}Burrows Since: ${RESET + session.last}
${GOLD + BOLD}Average Burrows: ${RESET + session.average}`;
}

/**
 * Command to reset the stats for the overall counter.
 */
register("command", () => {
    data.inqSession = {
        "inqs": 0,
        "burrows": 0,
        "last": 0,
        "average": 0,
    };
    counterOverlay.message = counterExample;
}).setName("resetInq");

/**
 * Announce inquisitor spawn on chat message appears.
 */
registerWhen(register("chat", (wow, mob) => {
    if (mob === "Minos Inquisitor") {
        announceMob(settings.inqAlert, "Minos Inquisitor", inquisitor.getX(), inquisitor.getY(), inquisitor.getZ());
        if (settings.inqCounter !== 0) updateInqCounter(true);
    } else if (settings.inqCounter !== 0) updateInqCounter(false);
}).setCriteria("${wow}! You dug out a ${mob}!"), () => getWorld() === "Hub" && getPerks().has("Mythological Ritual"));

/**
 * Tracks world for any inquisitors near player.
 */
let inquisitors = [];
export function getInquisitors() { return inquisitors };
registerWhen(register("step", () => {
    inquisitors = World.getAllEntitiesOfType(PLAYER_CLASS).filter(player => player.getName() === "Minos Inquisitor");

    if (inquisitors.length > 0) {
        Client.Companion.showTitle(`${GOLD + BOLD}INQUISITOR ${WHITE}DETECTED!`, "", 0, 25, 5);
        if (!data.moblist.includes("inquisitor")) inquisitors = [];
    }
}).setFps(2), () => getWorld() === "Hub" && settings.detectInq && getPerks().has("Mythological Ritual"));
registerWhen(register("renderWorld", () => {
    renderEntities(inquisitors, 1, 0.84, 0);
}), () => getWorld() === "Hub" && settings.detectInq && getPerks().has("Mythological Ritual"));
register("worldUnload", () => inquisitors = []);
