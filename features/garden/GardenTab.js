import settings from "../../utils/settings";
import { AQUA, BOLD, DARK_GREEN, DARK_RED, GRAY, GREEN, RED, RESET, WHITE } from "../../utils/constants";
import { getTime } from "../../utils/functions";
import { Overlay } from "../../utils/overlay";
import { data, registerWhen } from "../../utils/variables";
import { getWorld } from "../../utils/worlds";


/**
 * Variables used to represent and display visitors.
 */
const gardenExample =
`${AQUA + BOLD}Visitors ${WHITE}(5):
${GREEN + BOLD} Never
${GREEN + BOLD} Gonna
${GREEN + BOLD} Give
${GREEN + BOLD} You
${GREEN + BOLD} Up`;
const gardenOverlay = new Overlay("gardenTab", ["Garden"], () => true, data.VL, "moveVisitors", gardenExample);

/**
 * Fetches the visitor data in tablist and updates the Visitors Overlay every second.
 */
registerWhen(register("step", () => {
    if (!World.isLoaded()) return;

    const tablist = TabList.getNames();
    gardenOverlay.message = "";
    index = tablist.findIndex(tab => tab.includes("Visitors:"));
    if (index === -1) return;

    tab = tablist[index];
    while (tab.length > 3 && tab !== "§r       §r§6§lAccount Info§r") {
        gardenOverlay.message += tab + '\n';
        tab = tablist[++index];
    }
}).setFps(1), () => getWorld() === "Garden" && settings.gardenTab);


/**
 * Next Visitor stuff
 */
let next = 0;
export function getNextVisitor() { return next };
const nextExample = `${AQUA + BOLD}Next Visitor: ${WHITE}REVERT GARDEN`;
const nextOverlay = new Overlay("nextVisitor", ["all"], () => true, data.NL, "moveNext", nextExample);

registerWhen(register("step", () => {
    // Check tab case
    if (!World.isLoaded()) return;
    const visitors = TabList.getNames()
        ?.find(tab => tab.startsWith("§r§b§lVisitors:"))
        ?.removeFormatting()
        ?.replace(/[^a-zA-Z0-9\s]/g, '')
        ?.split(' ');

    let time = 0;
    for (let i = 1; i < visitors.length; i++) {
        let num = visitors[i].slice(0, -1);
        let frame = visitors[i].slice(-1);
        
        if (frame === "m") time += parseInt(num) * 60 + 60;
        else if (frame === "s") {
            if (time != 0) time -= 60;
            time += parseInt(num);
        }
    }
    if (time !== 0 && time < next - 60 || time > next + 60 || next === 0) next = time;

    // Return if 0
    if (next === 0) {
        nextOverlay.message = `${AQUA + BOLD}Next Visitor: ${RED + BOLD}Shipment Received`;
        return;
    }

    // Decrement
    nextOverlay.message = `${AQUA + BOLD}Next Visitor: ${WHITE + getTime(next--)}`;
}).setFps(1), () => getWorld() === "Garden" && (settings.nextVisitor || settings.warpGarden));

// Set next visitor time (assuming with 20% visitor reduction)
registerWhen(register("chat", () => {
    next = 720;
}).setCriteria("${npc} has arrived on your Garden!"), () => settings.nextVisitor || settings.warpGarden);


/**
 * Composter timers
 */
const compostExample =
`${DARK_GREEN + BOLD}Empty Compost: ${WHITE}loading
${DARK_GREEN + BOLD}Next Compost: ${WHITE}...`;
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
    if (!World.isLoaded()) return;
    const tablist = TabList.getNames();

    if (settings.gardenTab === 1) {
        if (tablist.find(tab => tab.includes("Time Left")) !== undefined)
            Client.showTitle(`${DARK_RED + BOLD} ${WHITE}COMPOSTER INACTIVE!`, "", 0, 25, 5);
        return;
    }

    if (emptyCompost <= 0) {
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
    const message = emptyCompost <= 100 ? `${RED + BOLD}Composter Empty!` : `${WHITE + getTime(emptyCompost)}`;
    const time = tablist.find(tab => tab.includes("Time Left")).removeFormatting().match(/(\d+)m (\d+)s|(\d+)s/);
    const next = !time ? `${RED + BOLD}Inactive` :
        getTime((time[1] ? parseInt(time[1], 10) : 0) * 60 + (time[2] ? parseInt(time[2], 10) : parseInt(time[3], 10)));
    compostOverlay.message =
`${DARK_GREEN + BOLD}Empty Compost: ${message}
${DARK_GREEN + BOLD}Next Compost: ${WHITE + next}`;
}).setFps(1), () => getWorld() === "Garden" && settings.gardenTab !== 0);
