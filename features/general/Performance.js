import settings from "../../utils/settings";
import toggles from "../../utils/toggles";
import { AQUA, BOLD, DARK_AQUA, DARK_GREEN, GOLD, GREEN, LOGO, RED, WHITE, YELLOW } from "../../utils/constants";
import { Overlay } from "../../utils/overlay";
import { data, registerWhen } from "../../utils/variables";
import { getWorld } from "../../utils/worlds";
import { formatNumber } from "../../utils/functions";


/**
 * Java packet types.
 */
let S03PacketTimeUpdate = Java.type('net.minecraft.network.play.server.S03PacketTimeUpdate');
let S37PacketStatistics = Java.type('net.minecraft.network.play.server.S37PacketStatistics');
let C16PacketClientStatus = Java.type('net.minecraft.network.play.client.C16PacketClientStatus');
let S01PacketJoinGame = Java.type('net.minecraft.network.play.server.S01PacketJoinGame');

/**
 * Variables used to represent TPS data.
 */
let tps = 20;
export function getTPS() { return tps };
const pastTps = [20, 20, 20];
let pastDate = 0;

/**
 * Calculates and updates the TPS (ticks per second) value.
 */
function calcTPS() {
    if (pastDate !== null) {
        const time = Date.now() - pastDate;
        tps = Math.min(20000 / time, 20);
        pastTps.shift();
        pastTps.push(tps);
        tps = Math.min(...pastTps);
    }
    pastDate = Date.now();
}
try {
    register('packetReceived', () => {
        calcTPS()
    }).setFilteredClass(S03PacketTimeUpdate);
} catch (err) {
    register('packetReceived', (packet) => {
        if (packet !== S03PacketTimeUpdate) return;
        calcTPS();
    });
}

/**
 * Variables used to represent ping data.
 */
let ping = 0;
export function getPing() { return ping };
let lastPing = 0;

/**
 * Sends a ping request packet to the server to measure the latency (ping).
 * If `lastPing` is not set (0), it sends the request and updates `lastPing` with the current time.
 */
function sendPingRequest() {
    if (lastPing === 0) {
        Client.sendPacket(new C16PacketClientStatus(C16PacketClientStatus.EnumState.REQUEST_STATS));
        lastPing = Date.now();
    }
};
registerWhen(register("step", () => {
    sendPingRequest();
}).setDelay(3), () => settings.serverStatus || toggles.statusCommand);

/**
 * Calculates the ping (latency) based on the difference between the current time
 * and the time when the last ping request was sent. Updates the `ping` value and resets `lastPing`.
 */
function calculatePing() {
    if (lastPing !== 0) {
        ping = Math.abs(Date.now() - lastPing);
        lastPing = 0;
    }
};
try {
    register('packetReceived', () => {
        calculatePing();
    }).setFilteredClasses([S01PacketJoinGame, S37PacketStatistics]);
} catch (err) {
    register('packetReceived', () => {
        if (packet !== S01PacketJoinGame || packet !== S37PacketStatistics) return;
        calculatePing();
    });
}

/**
 * Set fps cap
 */
let maxFps = Client.settings.getSettings().field_74350_i;
const setFps = register("worldLoad", () => {
    maxFps = Client.settings.getSettings().field_74350_i;
    setFps.unregister();
});

/**
 * Get soulflow amount using soulflow accessory in inventory
 */
let soulflow = 0;

register("step", () => {
    const container = Player.getContainer();
    if (container === null) return;

    container.getItems().forEach(item => {
        if (item !== null && item.getName().includes("Soulflow")) {
            const internal = item.getLore()[1].removeFormatting();
            if (internal.startsWith("Internalized:")) soulflow = internal.replace(/[^0-9]/g, '');
        }
    });
}).setFps(10);

/**
 * Variables used to represent and display player status.
 */
const statusExample = `${DARK_AQUA + BOLD}Ping: ${GREEN}420 ${AQUA}ms
${DARK_AQUA + BOLD}TPS: ${GREEN}666 ${AQUA}tps
${DARK_AQUA + BOLD}FPS: ${GREEN}510 ${AQUA}fps
${DARK_AQUA + BOLD}CPS: ${GREEN}6 ${AQUA}: ${GREEN}9
${DARK_AQUA + BOLD}SF: ${GREEN}995`;
const statusOverlay = new Overlay("serverStatus", ["all"], () => true, data.LL, "moveStatus", statusExample);

/**
 * Updates the status overlay message with the current ping, TPS, and FPS information.
 * Constructs a formatted message containing the ping in milliseconds, TPS in ticks per second,
 * and FPS (frames per second) using the values from the `ping`, `tps`, and `Client.getFPS()` respectively.
 */
registerWhen(register('tick', () => {
    statusOverlay.message = "";

    // Ping
    if (toggles.pingDisplay) {
        const pingColor = ping < 100 ? GREEN :
            ping < 200 ? DARK_GREEN :
            ping < 300 ? YELLOW :
            ping < 400 ? GOLD : RED;
        statusOverlay.message += `${DARK_AQUA + BOLD}Ping: ${pingColor + ping + AQUA} ms\n`;
    }

    // FPS
    if (toggles.fpsDisplay) {
        const fps = Client.getFPS();
        const fpsRatio = fps / maxFps;
        const fpsColor = fpsRatio > 0.9 ? GREEN :
            fpsRatio > 0.8 ? DARK_GREEN :
            fpsRatio > 0.7 ? YELLOW :
            fpsRatio > 0.6 ? GOLD : RED;
        statusOverlay.message += `${DARK_AQUA + BOLD}FPS: ${fpsColor + fps + AQUA} fps\n`;
    }

    // TPS
    if (toggles.tpsDisplay) {
        const tpsColor = tps > 19 ? GREEN :
            tps > 16 ? DARK_GREEN :
            tps > 13 ? YELLOW :
            tps > 10 ? GOLD : RED;

        statusOverlay.message += `${DARK_AQUA + BOLD}TPS: ${tpsColor + tps.toFixed(1) + AQUA} tps\n`;
    }

    // CPS
    if (toggles.cpsDisplay) {
        const leftCPS = CPS.getLeftClicks();
        const leftColor = leftCPS < 3 ? GREEN :
            leftCPS < 7 ? DARK_GREEN :
            leftCPS < 13 ? YELLOW :
            leftCPS < 21 ? GOLD : RED;
        const rightCPS = CPS.getRightClicks();
        const rightColor = rightCPS < 3 ? GREEN :
            rightCPS < 7 ? DARK_GREEN :
            rightCPS < 13 ? YELLOW :
            rightCPS < 21 ? GOLD : RED;

        statusOverlay.message += `${DARK_AQUA + BOLD}CPS: ${leftColor + leftCPS + AQUA} : ${rightColor + rightCPS}\n`;
    }

    // Soulflow
    if (toggles.soulflowDisplay) {
        const soulflowColor = soulflow > 100_000 ? GREEN :
            soulflow > 50_000 ? DARK_GREEN :
            soulflow > 25_000 ? YELLOW :
            soulflow > 10_000 ? GOLD : RED;
        
        statusOverlay.message += `${DARK_AQUA + BOLD}SF: ${soulflowColor + formatNumber(soulflow) + AQUA} ⸎`;
    }
}), () => settings.serverStatus || toggles.statusCommand);

export function getStatus(status) {
    switch (status) {
        case "ping":
            const pingColor = ping < 100 ? GREEN :
                ping < 200 ? DARK_GREEN :
                ping < 300 ? YELLOW :
                ping < 400 ? GOLD : RED;
            ChatLib.chat(`${LOGO + DARK_AQUA + BOLD}Ping: ${pingColor + ping + AQUA} ms`);
            break;
        case "tps":
            const tpsColor = tps > 19 ? GREEN :
                tps > 16 ? DARK_GREEN :
                tps > 13 ? YELLOW :
                tps > 10 ? GOLD : RED;
            ChatLib.chat(`${LOGO + DARK_AQUA + BOLD}TPS: ${tpsColor + tps.toFixed(1) + AQUA} tps`);
            break;
        case "fps":
            const fps = Client.getFPS();
            const fpsRatio = fps / maxFps;
            const fpsColor = fpsRatio > 0.9 ? GREEN :
                fpsRatio > 0.8 ? DARK_GREEN :
                fpsRatio > 0.7 ? YELLOW :
                fpsRatio > 0.6 ? GOLD : RED;
            ChatLib.chat(`${LOGO + DARK_AQUA + BOLD}FPS: ${fpsColor + fps + AQUA} fps`);
            break;
        case "cps":
            const leftCPS = CPS.getLeftClicks();
            const leftColor = leftCPS < 3 ? GREEN :
                leftCPS < 7 ? DARK_GREEN :
                leftCPS < 13 ? YELLOW :
                leftCPS < 21 ? GOLD : RED;
            const rightCPS = CPS.getRightClicks();
            const rightColor = rightCPS < 3 ? GREEN :
                rightCPS < 7 ? DARK_GREEN :
                rightCPS < 13 ? YELLOW :
                rightCPS < 21 ? GOLD : RED;

            ChatLib.chat(`${LOGO + DARK_AQUA + BOLD}CPS: ${leftColor + leftCPS + AQUA} : ${rightColor + rightCPS}`);
            break;
        case "soulflow":
        case "sf":
            const soulflowColor = soulflow > 100_000 ? GREEN :
                soulflow > 50_000 ? DARK_GREEN :
                soulflow > 25_000 ? YELLOW :
                soulflow > 10_000 ? GOLD : RED;
            
            ChatLib.chat(`${DARK_AQUA + BOLD}SF: ${soulflowColor + formatNumber(soulflow) + AQUA} ⸎`);
            break;
    }
}

/**
 * Check entity distance to player. Hide if too close or far.
 * 
 * @param {Entity} entity - The entity being checked.
 * @param {Position} pos - The entity's position.
 * @param {number} tick - The current tick.
 * @param {Event} event - The event being handled.
 */
registerWhen(register("renderEntity", (entity, pos, tick, event) => {
    const distance = entity.distanceTo(Player.asPlayerMP());
    if (settings.hideFarEntity !== 0 && distance >= settings.hideFarEntity)
        cancel(event);
    if (settings.hideCloseEntity !== 0 && distance <= settings.hideCloseEntity &&
        entity.entity.class.toString() === "class net.minecraft.client.entity.EntityOtherPlayerMP" && entity.name !== Player.name)
        cancel(event);
}).setPriority(Priority.LOWEST), () => {
    if (settings.hideFarEntity === 0 && settings.hideCloseEntity === 0) return false;
    const world = getWorld()?.toLowerCase() ?? "";
    const worlds = settings.hideWorlds.toLowerCase().split(", ");
    return worlds[0] === "" || worlds.includes(world);
});


/**
 * Prevents any particles from rendering.
 * 
 * @param {Particle} - The particle entity.
 * @param {MCTEnumParticleTypes} - Particle type name
 * @param {CancelableEvent} - Particle spawn event.
 */
registerWhen(register("spawnParticle", (particle, type, event) => {
    cancel(event);
}).setPriority(Priority.LOWEST), () => settings.hideParticles);
