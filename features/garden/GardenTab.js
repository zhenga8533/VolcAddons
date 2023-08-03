import settings from "../../settings";
import { AQUA, BOLD, DARK_RED, GREEN, RED, RESET, WHITE } from "../../utils/constants";
import { getTime } from "../../utils/functions";
import { Overlay } from "../../utils/overlay";
import { data, registerWhen } from "../../utils/variables";
import { getWorld } from "../../utils/worlds";


/**
 * Variables used to represent and display visitors.
 */
let tablist = null;
let visitors = 0;
let next = 0;
export function getNextVisitor() { return next };
const gardenExample =
`${AQUA}${BOLD}Visitors ${WHITE}(5):
${GREEN}${BOLD} Never
${GREEN}${BOLD} Gonna
${GREEN}${BOLD} Give
${GREEN}${BOLD} You
${GREEN}${BOLD} Up`;
const gardenOverlay = new Overlay("gardenTab", ["Garden"], data.VL, "moveVisitors", gardenExample);
const nextExample = `${AQUA}${BOLD}Next Visitor: ${WHITE}REVERT GARDEN`
const nextOverlay = new Overlay("nextVisitor", ["all"], data.NL, "moveNext", nextExample);

/**
 * Fetches the visitor data in tablist and updates the Visitors Overlay every second.
 */
registerWhen(register("step", () => {
    tablist = TabList.getNames();
    if (tablist === null) return;

    // Get Visitors
    gardenOverlay.message = "";
    visitors = tablist.findIndex((tab) => tab.includes("Visitors:"));
    if (!visitors) return;

    if (visitors != -1) {
        count = parseInt(tablist[visitors].removeFormatting().substring(11, 12)) + 1;
        for (count; count >= 0; count--)
            gardenOverlay.message = tablist[visitors + count] + "\n" + gardenOverlay.message;
    } else {
        gardenOverlay.message += `${AQUA}${BOLD}Visitors: ${RESET}(0)`;
    }
}).setFps(1), () => getWorld() === "Garden" && settings.gardenTab);

/**
 * Checks tablist for the time until next visitor and updates the Next Visitor Overlay every second.
 */
registerWhen(register("step", () => {
    // Update Next Visitor Message
    if (next > 0)
        next -= 1;
    nextOverlay.message = next > 0 ?
        `${AQUA}${BOLD}Next Visitor: ${RESET}${getTime(next)}`:
        `${AQUA}${BOLD}Next Visitor: ${RED}Shipment Received`;

    if (getWorld() != "Garden" || tablist === null) return;

    // Set Next Visitor
    nextVisit = tablist.find((tab) => tab.indexOf("Next Visitor:") != -1);
    if (!nextVisit) return;

    if (nextVisit != undefined && !nextVisit.includes("Full")) {
        nextVisit = nextVisit.removeFormatting().replace(/[^0-9. ]/g, '').trim().split(' ');

        next = nextVisit[0]
        if (nextVisit.length == 2)
            next = next * 60 + parseInt(nextVisit[1]);
    }
}).setFps(1), () => (settings.nextVisitor || settings.warpGarden));

registerWhen(register("chat", () => {
    next = 720;
}).setCriteria("Tarwen has arrived on your Garden!"), () => (settings.nextVisitor || settings.warpGarden));

/**
 * Checks tablist for inactive composter and displays a title if there is.
 */
registerWhen(register("step", () => {
    if (!tablist) return;

    composter = tablist.findIndex((tab) => tab.indexOf("INACTIVE") != -1);
    if (composter != -1)
        Client.Companion.showTitle(`${DARK_RED}${BOLD}COMPOSTER INACTIVE`, "", 0, 25, 5);
}).setFps(1), () => getWorld() === "Garden" && settings.gardenCompost);
