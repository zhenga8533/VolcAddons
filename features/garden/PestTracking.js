import { AQUA, BOLD, DARK_GRAY, DARK_GREEN, GOLD, GRAY, GREEN, RED, RESET, YELLOW } from "../../utils/constants";
import { getSlotCoords, getTime } from "../../utils/functions";
import { Overlay } from "../../utils/overlay";
import settings from "../../utils/settings";
import { data, registerWhen } from "../../utils/variables";
import { getWorld } from "../../utils/worlds";


/**
 * Sprayantor Tracking
 */
const sprayExample =
`${GREEN + BOLD}Sprays:
 ${AQUA}Plot 0 ${DARK_GRAY}(${GREEN}1m10s${DARK_GRAY})
 ${AQUA}Plot 0 ${DARK_GRAY}(${GREEN}1m01s${DARK_GRAY})`
const sprayOverlay = new Overlay("sprayDisplay", ["Garden"], () => true, data.SDL, "moveSpray", sprayExample);
const sprays = {};
const plots = new Set();
const pests = new Set();

/**
 * Track sprays using chat
 */
register("chat", (plot) => {
    sprays[plot] = 1800;
}).setCriteria("SPRAYONATOR! You sprayed Plot - ${plot} with ${material}!");

/**
 * Decrement spray timers every second
 */
register("step", () => {
    sprayOverlay.message = `${GREEN + BOLD}Sprays:`;

    const keys = Object.keys(sprays)
    keys.forEach(plot => {
        if (--sprays[plot] <= 0) {
            Client.showTitle(`${RED + BOLD}SPRAY EXPIRED: ${GREEN}Plot ${plot + RED}!`, '', 10, 50, 10);
            delete sprays[plot];
        }

        const time = sprays[plot];
        const sprayColor = time > 1200 ? GREEN :
            time > 600 ? YELLOW : RED;
        sprayOverlay.message += `\n ${AQUA}Plot ${plot + DARK_GRAY} (${sprayColor + getTime(time) + DARK_GRAY})`
    });
    if (keys.length === 0) sprayOverlay.message += `\n ${RED}None...`;
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
                plot.setStackSize(pest.removeFormatting().replace(/[^0-9]/g, ''));
                pests.add(index);
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
}), () => getWorld() === "Garden" && (settings.pestHighlight || settings.sprayDisplay));
registerWhen(register("guiClosed", () => {
    setPlots.unregister();
    setHighlight.unregister();
    pests.clear();
    plots.clear();
}), () => getWorld() === "Garden" && (settings.pestHighlight || settings.sprayDisplay));


/**
 * Alerts for pest spawns
 */
registerWhen(register("chat", (_, plot) => {
    Client.showTitle(`${GREEN}Plot ${GRAY}- ${AQUA + plot}`, `${GOLD}1 ${RED}Pest ${GRAY}has spawned...`);
}).setCriteria("${ew}! A Pest has appeared in Plot - ${plot}!"), () => getWorld() === "Garden" && settings.pestAlert);
registerWhen(register("chat", (_, num, plot) => {
    Client.showTitle(`${GREEN}Plot ${GRAY}- ${AQUA + plot}`, `${GOLD + num} ${RED}Pests ${GRAY}have spawned...`);
}).setCriteria("${ew}! ${num} Pests have spawned in Plot - ${plot}!"), () => getWorld() === "Garden" && settings.pestAlert);


/**
 * Pest swarm (more than 4 = loss farming fortune)
 */
const infested = register("step", () => {
    const loc = Scoreboard.getLines().find(line => line.getName().startsWith(" §7⏣"));
    if (loc === undefined) return;

    const count = loc.getName().removeFormatting().replace(/[^0-9]/g, '');
    Client.showTitle(`${DARK_GREEN + BOLD}SPREADING PLAGUE`, `${count} minions with ${BOLD}Taunt ${RESET}are in the way!`, 0, 25, 5);
}).setFps(1).unregister();

/**
 * Track chat for pest fortune messages
 */
registerWhen(register("chat", () => {
    infested.register();
}).setCriteria("  ൠ ☘ Farming Fortune has been reduced by ${percent}%!"), () => getWorld() === "Garden" && settings.infestationAlert);
registerWhen(register("chat", () => {
    infested.unregister();
}).setCriteria("Your Garden is no longer infested and your ☘ Farming Fortune has returned to normal!"), () => getWorld() === "Garden" && settings.infestationAlert);


/**
 * Pesthunter bonus tracking
 */
registerWhen(register("chat", () => {
    infested.register();
}).setCriteria("[NPC] Phillip: In exchange for ${pests} Pests, I've given you +${fortune}☘ Farming Fortune for 30m!"),
() => getWorld() === "Garden" && settings.infestationAlert);
