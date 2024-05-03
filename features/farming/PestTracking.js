import RenderLib from "../../../RenderLib";
import location from "../../utils/location";
import settings from "../../utils/settings";
import { AQUA, BOLD, DARK_GRAY, DARK_GREEN, DARK_RED, GOLD, GRAY, GREEN, RED, RESET, YELLOW } from "../../utils/constants";
import { getSlotCoords } from "../../utils/functions/find";
import { formatTime } from "../../utils/functions/format";
import { registerWhen } from "../../utils/register";
import { Overlay } from "../../utils/overlay";
import { data } from "../../utils/data";


/**
 * Sprayantor Tracking
 */
const sprayExample =
`${GREEN + BOLD}Sprays:
 ${AQUA}Plot 0 ${DARK_GRAY}(${GREEN}1m10s${DARK_GRAY})
 ${AQUA}Plot 0 ${DARK_GRAY}(${GREEN}1m01s${DARK_GRAY})`
const sprayOverlay = new Overlay("sprayDisplay", data.SDL, "moveSpray", sprayExample, ["Garden"]);
const sprays = {};
const plots = new Set();
const pests = new Set();
let swarm = {};
let hive = [];
let plotZone = "0";

/**
 * Sort the swarm dictionary into hive in descending pest order.
 */
function setHive() {
    const tablist = TabList.getNames();
    const pestIndex = tablist.findIndex(tab => tab === "§r§4§lPests:§r");
    hive = [];

    if (pestIndex === -1) {
        let entries = Object.entries(swarm);
        entries.sort((a, b) => b[1] - a[1]);
        hive = entries.map(entry => entry[0]);
    } else if (!tablist[pestIndex + 2].startsWith("§r Spray:"))
        hive = tablist[pestIndex + 2].split("§r§f, §r§b").map(plot => plot.replace(/\D/g, ''));
}

registerWhen(register("step", () => {
    if (!World.isLoaded()) return;
    const plotLine = Scoreboard.getLines().find(line => line.getName().startsWith("   §aPlot"));
    plotZone = plotLine?.getName()?.removeFormatting()?.trim()?.split(' ')?.[2]?.replace(/[^0-9]/g, '') ?? "0";
    setHive();
}).setFps(2), () => location.getWorld() === "Garden" && settings.gardenBox);


/**
 * Track sprays using chat
 */
registerWhen(register("chat", (plot) => {
    sprays[plot] = 1800;
}).setCriteria("SPRAYONATOR! You sprayed Plot - ${plot} with ${material}!"), () => location.getWorld() === "Garden");

/**
 * Decrement spray timers every second
 */
register("step", () => {
    let sprayMessage = `${GREEN + BOLD}Sprays:`;

    const keys = Object.keys(sprays)
    keys.forEach(plot => {
        if (--sprays[plot] <= 0) {
            Client.showTitle(`${RED + BOLD}SPRAY EXPIRED: ${GREEN}Plot ${plot + RED}!`, '', 10, 50, 10);
            delete sprays[plot];
        }

        const time = sprays[plot];
        const sprayColor = time > 1200 ? GREEN :
            time > 600 ? YELLOW : RED;
            sprayMessage += `\n ${AQUA}Plot ${plot + DARK_GRAY} (${sprayColor + formatTime(time) + DARK_GRAY})`
    });
    if (keys.length === 0) sprayMessage += `\n ${RED + BOLD}None...`;
    sprayOverlay.setMessage(sprayMessage);
}).setFps(1);

/**
 * Highlighting plot slot for pests and sprays
 */
const setHighlight = register("guiRender", () => {
    // Slot highlight rendering
    const containerType = Player.getContainer().getClassName();

    // Render infested plots
    pests.forEach(index => {
        const [x, y] = getSlotCoords(index, containerType);
    
        Renderer.translate(0, 0, 100);
        Renderer.drawRect(Renderer.color(139, 0, 0, 255), x, y, 16, 16);
    });

    // Render sprayed plots
    plots.forEach(index => {
        if (index in pests) return;
        const [x, y] = getSlotCoords(index, containerType);
    
        Renderer.translate(0, 0, 100);
        Renderer.drawRect(Renderer.color(57, 255, 20, 128), x, y, 16, 16);
    })
}).unregister();

/**
 * Track plot slot highlighting
 */
const setPlots = register("guiRender", () => {
    const container = Player.getContainer();

    // Set highlights
    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
            // Get plot data
            let index = 2 + i + j * 9;
            let plot = container.getStackInSlot(index);
            let lore = plot?.getLore();
            let pest = lore?.find(line => line.startsWith("§5§o§4§lൠ"));
            let spray = lore?.find(line => line.startsWith("§5§o§7Sprayed"));

            if (pest !== undefined) {
                // Set stack size as amount of pests and push onto rendering array
                const amount = pest.removeFormatting().replace(/[^0-9]/g, '');
                plot.setStackSize(amount);
                pests.add(index);
                swarm[plot.getName().split(' ')[2].removeFormatting()] = amount;
            }
            
            if (spray !== undefined) {
                // Get time left on spray
                let time = spray.removeFormatting().match(/(?: (\d+)m)? (\d+)s/);
                let minutes = time[1] ? parseInt(time[1], 10) : 0;
                let seconds = parseInt(time[2], 10);

                // Set stack size as amount of minutes left and push onto rendering array
                if (pest === undefined) {
                    plot.setStackSize(minutes);
                    plots.add(index);
                }

                // Set time left on spray (backup)
                sprays[plot.getName().removeFormatting().replace(/[^0-9]/g, '')] = minutes * 60 + parseInt(seconds);
            }
        }
    }
}).unregister();

/**
 * Tracks when to register plot gui triggers
 */
registerWhen(register("guiOpened", () => {
    Client.scheduleTask(1, () => {
        if (Player.getContainer().getName() !== "Configure Plots") return;
        setPlots.register();
        setHighlight.register();
    })
}), () => location.getWorld() === "Garden" && (settings.pestHighlight || settings.sprayDisplay));
registerWhen(register("guiClosed", () => {
    setPlots.unregister();
    setHighlight.unregister();
    pests.clear();
    plots.clear();
    setHive();
}), () => location.getWorld() === "Garden" && (settings.pestHighlight || settings.sprayDisplay));


/**
 * Pest warp command
 */
let lastPlot = undefined;
register("command", () => {
    setHive();
    if (hive.length === 0 || !location.getZone().includes("ൠ")) {
        Client.showTitle(`${DARK_RED}Pests Controlled!`, "No plots have any pests!", 10, 50, 10);
        return;
    }

    const plot = hive.find(p => p != lastPlot || p != plotZone);
    if (plot === undefined) {
        Client.showTitle(`${DARK_RED}Infested!`, "You are standing in a plot with pests!", 10, 50, 10);
        return;
    }

    Client.showTitle(`${DARK_GREEN}Warping...`, `Teleporting to plot ${plot}!`, 10, 50, 10);
    ChatLib.command(`plottp ${plot}`);
    
    lastPlot = plot;
    delete swarm[plot];
}).setName("pesttp");


/**
 * Alerts for pest spawns
 */
registerWhen(register("chat", (_, plot) => {
    Client.showTitle(`${GREEN}Plot ${GRAY}- ${AQUA + plot}`, `${GOLD}1 ${RED}Pest ${GRAY}has spawned...`, 10, 50, 10);
    swarm[plot] = (swarm[plot] ?? 0) + 1;
    setHive();
}).setCriteria("${ew}! A Pest has appeared in Plot - ${plot}!"), () => location.getWorld() === "Garden" && settings.pestAlert);
registerWhen(register("chat", (_, num, plot) => {
    Client.showTitle(`${GREEN}Plot ${GRAY}- ${AQUA + plot}`, `${GOLD + num} ${RED}Pests ${GRAY}have spawned...`, 10, 50, 10);
    swarm[plot] = (swarm[plot] ?? 0) + num;
    setHive();
}).setCriteria("${ew}! ${num} Pests have spawned in Plot - ${plot}!"), () => location.getWorld() === "Garden" && settings.pestAlert);


/**
 * Pest swarm
 */
registerWhen(register("step", () => {
    const count = parseInt(TabList.getNames().find(name => name.startsWith("§r Alive:"))?.split(' ')?.[2]?.removeFormatting() ?? 0);
    if (count < settings.infestationAlert) return;
    Client.showTitle(`${DARK_GREEN + BOLD}SPREADING PLAGUE`, `${count} minions with ${BOLD}Taunt ${RESET}are in the way!`, 0, 25, 5);
}).setFps(1).unregister(), () => settings.infestationAlert !== 0 && location.getWorld() === "Garden");


/**
 * Pesthunter bonus tracking.
 */
const bonuses = {};
let remain = 0;
function addPests(pest) {
    if (pest in bonuses) addPests(pest.toString() + String.fromCharCode(Math.floor(Math.random() * 26) + 97));
    else bonuses[pest] = 1800;
}
registerWhen(register("chat", (_, fortune) => {
    remain = 1800;
    addPests(fortune);
}).setCriteria("[NPC] Phillip: In exchange for ${pests} Pests, I've given you +${fortune}☘ Farming Fortune for 30m!"),
() => location.getWorld() === "Garden" && settings.pesthunterBonus);

/**
 * Track bonus timer
 */
const bonusExample = `${YELLOW + BOLD}Pest Bonus: ${GREEN}T1 FIGHTING`;
const bonusOverlay = new Overlay("pesthunterBonus", data.PHL, "moveBonus", bonusExample, ["Garden"]);

registerWhen(register("step", () => {
    let bonusMessage = `${YELLOW + BOLD}Pest Bonus: `;
    let fortune = 0;
    Object.keys(bonuses).forEach(bonus => {
        if (fortune === 0) time = bonuses[bonus];
        if (--bonuses[bonus] === 0) delete bonuses[bonus];
        else fortune += parseInt(bonus.replace(/[^0-9]/g, ''));
    });

    if (fortune === 0) bonusMessage += `${RED + BOLD}Inactive!`;
    else {
        const bonusColor = remain > 1200 ? GREEN :
        remain > 600 ? YELLOW : RED;
        bonusMessage += `${GOLD + fortune}☘ ${bonusColor}(${formattime(--remain)})`
    }

    bonusOverlay.setMessage(bonusMessage);
}).setFps(1), () => location.getWorld() === "Garden" && settings.pesthunterBonus);


/**
 * Garden box rendering.
 */
registerWhen(register("renderWorld", () => {
    const color = hive.includes(plotZone) ? [1, 0, 0] : 
        sprays.hasOwnProperty(plotZone) ? [0, 1, 0] : [1, 1, 1];
    const x = Math.floor((Player.getX() + 240) / 96);
    const z = Math.floor((Player.getZ() + 240) / 96);

    RenderLib.drawEspBox(-192 + x * 96, 67, -192 + z * 96, 96, 10, ...color, 1, true);
}), () => location.getWorld() === "Garden" && settings.gardenBox);
