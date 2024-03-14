import settings from "../../utils/settings";
import { AQUA, BOLD, DARK_GREEN, DARK_RED, GREEN, RED, WHITE } from "../../utils/constants";
import { Overlay } from "../../utils/overlay";
import { getTime } from "../../utils/functions/format";
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
const gardenOverlay = new Overlay("gardenTab", ["all"], () => true, data.VL, "moveVisitors", gardenExample);
let nextVisitor = 0;
let visitorCount = 5;
let visitors = [`${AQUA + BOLD}Visitors: ${WHITE}(5)`, ` ${RED}???`, ` ${RED}???`, ` ${RED}???`, ` ${RED}???`, ` ${RED}???`];

/**
 * Fetches the visitor data in tablist and updates the Visitors Overlay every second.
 */
registerWhen(register("step", () => {
    if (!World.isLoaded()) return;

    const tablist = TabList.getNames();
    gardenOverlay.message = "";
    let visitorIndex = tablist.findIndex(tab => tab.startsWith("§r§b§lVisitors:"));
    if (visitorIndex === -1) return;

    // Get all visitors
    visitorCount = parseInt(tablist[visitorIndex].split(' ')[1].substring(5, 6));
    visitors = [];
    for (let i = 0; i <= visitorCount; i++) {
        let visitor = tablist[visitorIndex + i];
        gardenOverlay.message += visitor + '\n';
        visitors.push(visitor);
    }

    // Get next visitor timing
    let tabTime = 0;
    const visitorTime = tablist[visitorIndex + visitorCount + 1].removeFormatting().replace(/[^0-9ms\s]/g, '').trim().split(' ');
    if (visitorTime.length === 3) tabTime = 60 * visitorTime[1].replace('m', '') + parseInt(visitorTime[2].replace('s', ''));
    else if (visitorTime.length === 2) {
        if (visitorTime[1].endsWith('m')) tabTime = 60 * visitorTime[1].replace('m', '');
        else tabTime = parseInt(visitorTime[1].replace('s', ''));
    }

    // Update next display
    if (tabTime !== 0 && tabTime < nextVisitor - 60 || tabTime > nextVisitor + 60 || nextVisitor === 0) nextVisitor = tabTime;
    if (nextVisitor > 0) gardenOverlay.message += ` Next Visitor: ${AQUA + getTime(nextVisitor)}`;
    else gardenOverlay.message += ` Next Visitor: ${RED + BOLD}Queue Full!`;
}).setFps(1), () => getWorld() === "Garden" && settings.gardenTab);


/**
 * Next Visitor stuff
 */
registerWhen(register("step", () => {
    // Decrement visitor timer
    nextVisitor--;
    if (getWorld() === "Garden") return;

    // Update visitor display outside Garden
    if (nextVisitor <= 0 && visitorCount < 5) {
        visitorCount++;
        visitors[0] = `${AQUA + BOLD}Visitors: ${WHITE}(${visitorCount})`;
        visitors.push(` ${RED}???`);
        nextVisitor = 720;
    }

    gardenOverlay.message = "";
    visitors.forEach(visitor => {
        gardenOverlay.message += visitor + '\n';
    });
    if (nextVisitor > 0) gardenOverlay.message += ` Next Visitor: ${AQUA + getTime(nextVisitor)}`;
    else gardenOverlay.message += ` Next Visitor: ${RED + BOLD}Queue Full!`;
}).setFps(1), () => settings.gardenTab);

// Set next visitor time (assuming with 20% visitor reduction)
registerWhen(register("chat", () => {
    nextVisitor = 720;
}).setCriteria("${npc} has arrived on your Garden!"), () => settings.gardenTab);


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
    const nextCompost = !time ? `${RED + BOLD}Inactive` :
        getTime((time[1] ? parseInt(time[1], 10) : 0) * 60 + (time[2] ? parseInt(time[2], 10) : parseInt(time[3], 10)));
    compostOverlay.message =
`${DARK_GREEN + BOLD}Composter:
${GREEN}Empty: ${message}
${GREEN}Next: ${WHITE + nextCompost}`;
}).setFps(1), () => getWorld() === "Garden" && settings.gardenTab !== 0);
