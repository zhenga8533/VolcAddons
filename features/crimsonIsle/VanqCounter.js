import settings from "../../settings";
import { BOLD, RED, RESET } from "../../utils/constants";
import { Overlay } from "../../utils/overlay";
import { data, registerWhen } from "../../utils/variables";
import { getWorld } from "../../utils/worlds";


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
`${RED}${BOLD}Total Vanqs: ${RESET}Xue
${RED}${BOLD}Total Kills: ${RESET}Hua
${RED}${BOLD}Kills Since: ${RESET}Piao
${RED}${BOLD}Average Kills: ${RESET}Piao`
const counterOverlay = new Overlay("vanqCounter", ["Crimson Isle"], data.CL, "moveCounter", counterExample);

/**
 * Uses the "Book of Stats" to track whenever player kills an entity and updates the Vanquisher Overlay.
 */
registerWhen(register("entityDeath", () => {
    if (Player.getHeldItem() == null) return;

    const heldItem = Player.getHeldItem().getNBT().getCompoundTag("tag").getCompoundTag("ExtraAttributes").getString("id");
    const newKills = Player.getHeldItem().getNBT().getCompoundTag("tag").getCompoundTag("ExtraAttributes").getInteger("stats_book");

    if (heldItem in items) {
        killsDiff = Math.abs(newKills - items[heldItem]);

        if (killsDiff > 10) items[heldItem] = newKills; // In order for mobs in other islands to not count
        else {
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
            counterOverlay.message = settings.vanqCounter == 1 ?
`${RED}${BOLD}Total Vanqs: ${RESET}${data.vanqSession.vanqs}
${RED}${BOLD}Total Kills: ${RESET}${data.vanqSession.kills}
${RED}${BOLD}Kills Since: ${RESET}${data.vanqSession.last}
${RED}${BOLD}Average Kills: ${RESET}${data.vanqSession.average}`
:
`${RED}${BOLD}Total Vanqs: ${RESET}${session.vanqs}
${RED}${BOLD}Total Kills: ${RESET}${session.kills}
${RED}${BOLD}Kills Since: ${RESET}${session.last}
${RED}${BOLD}Average Kills: ${RESET}${session.average}`;
        }
    } else items[heldItem] = newKills;
}), () => getWorld() === "Crimson Isle" && settings.vanqCounter);

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
}).setCriteria("A Vanquisher is spawning nearby!"), () => getWorld() === "Crimson Isle" && settings.vanqCounter);

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
