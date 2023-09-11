import settings from "../../utils/settings";
import { BOLD, BLUE, RESET } from "../../utils/constants";
import { Overlay } from "../../utils/overlay";
import { data, registerWhen } from "../../utils/variables";
import { getTime } from "../../utils/functions";


/**
 * Variables used to track and display item and vanquisher kill counts.
 */
let items = {};
let session = {
    "kills": 0,
    "time": 0,
    "average": 0
};
const counterExample =
`${BLUE}${BOLD}Total Kills: ${RESET}this
${BLUE}${BOLD}Time Passed: ${RESET}game
${BLUE}${BOLD}Hourly Kills: ${RESET}sucks.`;
const counterOverlay = new Overlay("killCounter", ["all"], () => true, data.JL, "moveKills", counterExample);

function updateCounter() {
    counterOverlay.message = 
`${BLUE}${BOLD}Total Kills: ${RESET}${session.kills} kills
${BLUE}${BOLD}Time Passed: ${RESET}${getTime(session.time)}
${BLUE}${BOLD}Hourly Kills: ${RESET}${session.average} kills/hr`;
}

/**
 * Uses the "Book of Stats" to track whenever player kills an entity and updates the Vanquisher Overlay.
 */
registerWhen(register("entityDeath", () => {
    if (Player.getHeldItem() === null) return;

    const ExtraAttributes = Player.getHeldItem().getNBT().getCompoundTag("tag").getCompoundTag("ExtraAttributes");
    const heldItem = ExtraAttributes.getString("id");
    const newKills = ExtraAttributes.getInteger("stats_book");

    if (heldItem in items) {
        killsDiff = Math.abs(newKills - items[heldItem]);

        // Overall
        session.kills += killsDiff;
        session.average = Math.round(session.kills / session.time * 3600);
        items[heldItem] = newKills;

        // Update HUD
        updateCounter();
    } else items[heldItem] = newKills;
}), () => settings.vanqCounter !== 0);

registerWhen(register("step", () => {
    if (session.kills === 0) return;
    
    session.time++;
    session.average = Math.round(session.kills / session.time * 3600);
    updateCounter();
}).setFps(1), () => settings.vanqCounter !== 0);

/**
 * Command to reset the stats for the overall counter.
 */
register("command", () => {
    session = {
        "kills": 0,
        "time": 0,
        "average": 0,
    };
}).setName("resetCounter");
