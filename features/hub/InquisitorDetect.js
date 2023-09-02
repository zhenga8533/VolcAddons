import settings from "../../settings";
import { BOLD, GOLD, WHITE, RESET } from "../../utils/constants";
import { announceMob } from "../../utils/functions";
import { getMayor, getPerks } from "../../utils/mayor";
import { Overlay } from "../../utils/overlay";
import { data, registerWhen } from "../../utils/variables";
import { getWorld } from "../../utils/worlds";


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
`${GOLD}${BOLD}Total Inqs: ${RESET}Who.
${GOLD}${BOLD}Total Burrows: ${RESET}Let.
${GOLD}${BOLD}Burrows Since: ${RESET}Him.
${GOLD}${BOLD}Average Burrows: ${RESET}Cook.`
const counterOverlay = new Overlay("inqCounter", ["Hub"], () => getMayor() === "Diana" && getPerks().has("Mythological Ritual"),
data.IL, "moveInq", counterExample);

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
registerWhen(register("chat", (mob) => {
    if (mob === "Minos Inquisitor") {
        if (settings.inqAlert !== 0) announceMob(settings.inqAlert, "Minos Inquisitor", inquisitor.getX(), inquisitor.getY(), inquisitor.getZ());
        else if (settings.inqCounter !== 0) updateInqCounter(true);
    } else updateInqCounter(false);
}).setCriteria("${wow}! You dug out a ${mob}!"), () => getWorld() === "Hub" && getPerks().has("Mythological Ritual") && getMayor() === "Diana");

/**
 * Tracks world for any inquisitors near player.
 */
let inquisitors = [];
export function getInquisitors() { return inquisitors };
registerWhen(register("tick", () => {
    inquisitors = [];

    entities = World.getAllEntitiesOfType(PLAYER_CLASS);
    inqs = entities.filter((entity) => entity.getName().equals("Minos Inquisitor"));

    if (inqs.length > 0) {
        Client.Companion.showTitle(`${GOLD}${BOLD}INQUISITOR ${WHITE}DETECTED!`, "", 0, 25, 5);
        if (data.moblist.includes("inquisitor"))
            inqs.forEach(inq => { inquisitors.push(inq) });
    }
}), () => getWorld() === "Hub" && settings.detectInq === true && getPerks().has("Mythological Ritual") && getMayor() === "Diana");
