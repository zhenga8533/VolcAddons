import settings from "../../utils/settings";
import { BOLD, GOLD, WHITE, RESET, RED, PLAYER_CLASS } from "../../utils/constants";
import { getPerks } from "../../utils/mayor";
import { announceMob } from "../../utils/functions/misc";
import { Overlay } from "../../utils/overlay";
import { data, registerWhen } from "../../utils/variables";
import { getWorld } from "../../utils/worlds";
import { Hitbox, renderEntities } from "../../utils/waypoints";


/**
 * Inquisitor alert variables.
 */
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
 * @param {Boolean} inqSpawned - True if inquisitor spawned, false otherwise.
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
        announceMob(settings.inqAlert, "Minos Inquisitor", Player.getX(), Player.getY(), Player.getZ());
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
        if (inquisitors.find(inquisitor => inquisitor.getEntity().func_110143_aJ() === 0) !== undefined)
            Client.Companion.showTitle(`${GOLD + BOLD}INQUISITOR ${RED}DEAD!`, "", 0, 50, 10);
        else Client.Companion.showTitle(`${GOLD + BOLD}INQUISITOR ${WHITE}DETECTED!`, "", 0, 25, 5);

        if (!data.moblist.includes("inquisitor")) inquisitors = [];
    }
}).setFps(2), () => getWorld() === "Hub" && settings.detectInq && getPerks().has("Mythological Ritual"));
new Hitbox(() => getWorld() === "Hub" && settings.detectInq && getPerks().has("Mythological Ritual"), (pt) => {
    renderEntities(inquisitors, 1, 0.84, 0, pt, "Inspector Gadget");
});
register("worldUnload", () => inquisitors = []);
