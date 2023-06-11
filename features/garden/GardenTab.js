import settings from "../../settings";
import { data, getWorld, registerWhen } from "../../utils/variables";
import { AQUA, BOLD, DARK_RED, GREEN, RED, RESET, WHITE } from "../../utils/constants";
import { getTime } from "../../utils/functions";
import { Overlay } from "../../utils/overlay";

// Visitor Tablist Variables
let tablist = null;
let visitors = 0;

// Next Visitor Display
let next = 0;

const gardenExample =
`${AQUA}${BOLD}Visitors ${WHITE}(5):
${GREEN}${BOLD} Never
${GREEN}${BOLD} Gonna
${GREEN}${BOLD} Give
${GREEN}${BOLD} You
${GREEN}${BOLD} Up`;
const gardenOverlay = new Overlay("gardenTab", ["garden"], data.VL, "moveVisitors", gardenExample);

const nextExample = `${AQUA}${BOLD}Next Visitor: ${WHITE}REVERT GARDEN`
const nextOverlay = new Overlay("nextVisitor", ["all"], data.NL, "moveNext", nextExample);

// Check Tab
registerWhen(register("step", () => {
    // Update Next Visitor Message
    if (next > 0) {
        next -= 1;
        nextOverlay.message = `${AQUA}${BOLD}Next Visitor: ${RESET}${getTime(next)}`;
    } else {
        nextOverlay.message = `${AQUA}${BOLD}Next Visitor: ${RED}Shipment Received`;
    }

    if (getWorld() != "garden") return;

    try {
        tablist = TabList.getNames();

        // Get tab and clear old data
        gardenOverlay.message = "";

        // Get Visitors
        visitors = tablist.findIndex((tab) => tab.indexOf("Visitors:") != -1);

        if (visitors != -1) {
            count = parseInt(tablist[visitors].removeFormatting().substring(11, 12)) + 1;
            for (count; count >= 0; count--)
                gardenOverlay.message = tablist[visitors + count] + "\n" + gardenOverlay.message;
        } else {
            gardenOverlay.message += `${AQUA}${BOLD}Visitors: ${RESET}(0)\n\n`;
        }

        // Set Next Visitor
        nextVisit = tablist.find((tab) => tab.indexOf("Next Visitor:") != -1);
        gardenOverlay.message += nextVisit

        if (!nextVisit.includes("Full")) {
            nextVisit = nextVisit.removeFormatting().replace(/[^0-9. ]/g, '').trim().split(' ');

            next = nextVisit[0]
            if (nextVisit.length == 2)
                next = next * 60 + parseInt(nextVisit[1]);
        }
    } catch(err) {
        console.log(err);
    }
}).setFps(1), () => settings.nextVisitor || settings.gardenTab);

registerWhen(register("step", () => {
    // Get Composter
    try {
        composter = tablist.findIndex((tab) => tab.indexOf("INACTIVE") != -1);
        if (composter != -1)
            Client.Companion.showTitle(`${DARK_RED}${BOLD}COMPOSTER INACTIVE`, "", 0, 25, 5);
    } catch(err) {
        console.log(err);
    }
}).setFps(1), () => getWorld() == "garden" && settings.gardenCompost);
