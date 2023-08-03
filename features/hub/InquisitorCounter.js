import settings from "../../settings";
import { BOLD, GOLD, RESET } from "../../utils/constants";
import { getMayor, getPerks } from "../../utils/mayor";
import { Overlay } from "../../utils/overlay";
import { data, registerWhen } from "../../utils/variables";
import { getWorld } from "../../utils/worlds";


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
`${GOLD}${BOLD}Total Inqs: ${RESET}Who.
${GOLD}${BOLD}Total Burrows: ${RESET}Let.
${GOLD}${BOLD}Burrows Since: ${RESET}Him.
${GOLD}${BOLD}Average Burrows: ${RESET}Cook.`
const counterOverlay = new Overlay("inqCounter", ["Hub"], data.IL, "moveInq", counterExample);

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
    counterOverlay.message = settings.inqCounter == 1 ?
`${GOLD}${BOLD}Total Inqs: ${RESET}${data.inqSession.inqs}
${GOLD}${BOLD}Total Burrows: ${RESET}${data.inqSession.burrows}
${GOLD}${BOLD}Burrows Since: ${RESET}${data.inqSession.last}
${GOLD}${BOLD}Average Burrows: ${RESET}${data.inqSession.average}`
:
`${GOLD}${BOLD}Total Inqs: ${RESET}${session.inqs}
${GOLD}${BOLD}Total Burrows: ${RESET}${session.burrows}
${GOLD}${BOLD}Burrows Since: ${RESET}${session.last}
${GOLD}${BOLD}Average Burrows: ${RESET}${session.average}`;
}

/**
 * Updates inq counter if mob is not a champion or inquisitor (handled seperately).
 *
 * @param {string} _ - Useless random word used when digging out a burrow.
 * @param {string} mob - Name of the mob that spawned from burrow.
 */
registerWhen(register("chat", (_, mob) => {
    if (mob != "Minos Champion")
        updateInqCounter(false);
}).setCriteria("${_}! You dug out a ${mob}!"), () => getWorld() === "Hub" &&
getMayor() === "Diana" && getPerks().has("Mythological Ritual"));

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
