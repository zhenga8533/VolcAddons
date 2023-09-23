import settings from "../../utils/settings";
import { AQUA, BOLD, DARK_GREEN, DARK_RED, GRAY, GREEN, RED, RESET, WHITE } from "../../utils/constants";
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
let lastTick = 0;
export function getNextVisitor() { return next };
const gardenExample =
`${AQUA}${BOLD}Visitors ${WHITE}(5):
${GREEN}${BOLD} Never
${GREEN}${BOLD} Gonna
${GREEN}${BOLD} Give
${GREEN}${BOLD} You
${GREEN}${BOLD} Up`;
const gardenOverlay = new Overlay("gardenTab", ["Garden"], () => true, data.VL, "moveVisitors", gardenExample);
const nextExample = `${AQUA}${BOLD}Next Visitor: ${WHITE}REVERT GARDEN`
const nextOverlay = new Overlay("nextVisitor", ["all"], () => true, data.NL, "moveNext", nextExample);

/**
 * Fetches the visitor data in tablist and updates the Visitors Overlay every second.
 */
registerWhen(register("step", () => {
    tablist = TabList?.getNames();
    gardenOverlay.message = "";
    visitors = tablist?.findIndex(tab => tab.includes("Visitors:"));
    if (visitors === undefined) return;

    if (visitors !== -1) {
        count = parseInt(tablist[visitors].removeFormatting().substring(11, 12)) + 1;
        for (count; count >= 0; count--)
            gardenOverlay.message = tablist[visitors + count] + "\n" + gardenOverlay.message;
    } else {
        gardenOverlay.message += `${AQUA}${BOLD}Visitors: ${RESET}(0)`;
    }
}).setFps(1), () => getWorld() === "Garden" && settings.gardenTab === true);

/**
 * Checks tablist for the time until next visitor and updates the Next Visitor Overlay every second.
 */
registerWhen(register("step", () => {
    // Update Next Visitor Message
    if (next > 0) next -= 1;
    nextOverlay.message = next > 0 ?
        `${AQUA}${BOLD}Next Visitor: ${RESET}${getTime(next)}`:
        `${AQUA}${BOLD}Next Visitor: ${RED}Shipment Received`;

    if (getWorld() !== "Garden" || tablist === null) return;

    // Set Next Visitor
    nextVisit = tablist.find((tab) => tab.indexOf("Next Visitor:") !== -1);
    if (!nextVisit) return;

    if (nextVisit !== undefined && !nextVisit.includes("Full")) {
        nextVisit = nextVisit.removeFormatting().replace(/[^0-9. ]/g, '').trim().split(' ');

        next = nextVisit[0];
        if (nextVisit.length === 2) next = next * 60 + parseInt(nextVisit[1]);
        const estimated = next / (lastTick - next);
        if (estimated > 0 && estimated !== next)
            nextOverlay.message = `${AQUA}${BOLD}Next Visitor: ${RESET}${getTime(next)} ${GRAY}[ETA: ${getTime(estimated)}]`;
        lastTick = next;
    }
}).setFps(1), () => settings.nextVisitor === true || settings.warpGarden === true);

/**
 * Composter timers ...
 */
const compostExample =
`${DARK_GREEN}${BOLD}Empty Compost: ${WHITE}loading
${DARK_GREEN}${BOLD}Next Compost: ${WHITE}...`;
const compostOverlay = new Overlay("compostTab", ["Garden"], () => settings.compostTab === 2, data.OL, "moveCompost", compostExample);
let emptyCompost = 0;

/**
 * Tracks time until compost empty
 */
function updateCompost() {
    const container = Player.getContainer();
    if (container.getName() !== "Composter") return;
    const cropMeter = container.getStackInSlot(46)?.getLore();
    const fuelMeter = container.getStackInSlot(52)?.getLore();
    if (cropMeter === undefined || fuelMeter === undefined) return;

    // Composter Upgrades
    const costUpgrade = data.composterUpgrades["Cost Reduction"];
    const speed = (600 / (1 + data.composterUpgrades["Composter Speed"] * 0.2));

    // Run out calc
    const crop = Object.entries(cropMeter)[1][1].removeFormatting().replace(/[\s,]/g, '').replace('/', ' ').split(' ')[0];
    const fuel = Object.entries(fuelMeter)[1][1].removeFormatting().replace(/[\s,]/g, '').replace('/', ' ').split(' ')[0];
    const noCrop = crop / (4000 * (1 - costUpgrade/100)) * speed;
    const noFuel = fuel / (2000 * (1 - costUpgrade/100)) * speed;
    emptyCompost = Math.min(noCrop, noFuel);
}
registerWhen(register("guiOpened", () => {
    Client.scheduleTask(1, updateCompost);
}), () => getWorld() === "Garden" && settings.compostTab === 2);
registerWhen(register("guiMouseClick", () => {
    Client.scheduleTask(1, updateCompost);
}), () => getWorld() === "Garden" && settings.compostTab === 2);

/**
 * Update compost overlay.
 */
registerWhen(register("step", () => {
    if (tablist === null) return;

    if (settings.gardenTab === 1) {
        if (tablist.find(tab => tab.includes("Time Left")) !== undefined)
            Client.Companion.showTitle(`${DARK_RED}${BOLD} ${WHITE}COMPOSTER INACTIVE!`, "", 0, 25, 5);
        return;
    }

    if (emptyCompost === 0) {
        // Composter Upgrades
        const costUpgrade = data.composterUpgrades["Cost Reduction"];
        const speed = (600 / (1 + data.composterUpgrades["Composter Speed"] * 0.2));

        // Run out calc
        const organic = tablist.find(tab => tab.includes("Organic Matter")).removeFormatting();
        const crop = organic.replace(/\D/g, "") * (organic.includes('k') ? 1000 : 1);
        const fuel = tablist.find(tab => tab.includes("Fuel")).removeFormatting().replace(/\D/g, "") * 1000;
        const noCrop = crop / (4000 * (1 - costUpgrade/100)) * speed;
        const noFuel = fuel / (2000 * (1 - costUpgrade/100)) * speed;
        
        emptyCompost = Math.min(noCrop, noFuel);
    }

    emptyCompost--;
    const message = emptyCompost <= 0 ? `${RED}Composter Empty!` : `${WHITE}${getTime(emptyCompost)}`;
    const time = tablist.find(tab => tab.includes("Time Left")).removeFormatting().match(/(\d+)m (\d+)s|(\d+)s/);
    const next = !time ? `${RED}Inactive` :
        getTime((time[1] ? parseInt(time[1], 10) : 0) * 60 + (time[2] ? parseInt(time[2], 10) : parseInt(time[3], 10)));
    compostOverlay.message =
`${DARK_GREEN}${BOLD}Empty Compost: ${message}
${DARK_GREEN}${BOLD}Next Compost: ${WHITE}${next}`;
}).setFps(1), () => getWorld() === "Garden" && settings.gardenTab !== 0);
