import settings from "../../utils/settings";
import { AQUA, BOLD, DARK_AQUA, DARK_GREEN, GOLD, GREEN, LOGO, RED, WHITE, YELLOW } from "../../utils/constants";
import { Overlay } from "../../utils/overlay";
import { data, registerWhen } from "../../utils/variables";
import { getWorld } from "../../utils/worlds";


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
register("step", () => {
    sendPingRequest();
}).setDelay(3);

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
 * Variables used to represent and display player status.
 */
const statusExample = `${DARK_AQUA}${BOLD}Ping: ${WHITE}Peek
${DARK_AQUA}${BOLD}TPS: ${WHITE}A
${DARK_AQUA}${BOLD}FPS: ${WHITE}Boo`;
const statusOverlay = new Overlay("serverStatus", ["all"], () => true, data.LL, "moveStatus", statusExample);
const maxFps = Client.settings.getSettings().field_74350_i;

/**
 * Updates the status overlay message with the current ping, TPS, and FPS information.
 * Constructs a formatted message containing the ping in milliseconds, TPS in ticks per second,
 * and FPS (frames per second) using the values from the `ping`, `tps`, and `Client.getFPS()` respectively.
 */
register('step', () => {
    const pingColor = ping < 100 ? GREEN :
        ping < 200 ? DARK_GREEN :
        ping < 300 ? YELLOW :
        ping < 400 ? GOLD : RED;
    const tpsColor = tps > 19 ? GREEN :
        tps > 16 ? DARK_GREEN :
        tps > 13 ? YELLOW :
        tps > 10 ? GOLD : RED;
    const fps = Client.getFPS();
    const fpsRatio = fps / maxFps;
    const fpsColor = fpsRatio > 0.9 ? GREEN :
        fpsRatio > 0.8 ? DARK_GREEN :
        fpsRatio > 0.7 ? YELLOW :
        fpsRatio > 0.6 ? GOLD : RED;

    statusOverlay.message = 
`${DARK_AQUA}${BOLD}Ping: ${pingColor}${ping} ${AQUA}ms
${DARK_AQUA}${BOLD}TPS: ${tpsColor}${tps.toFixed(1)} ${AQUA}tps
${DARK_AQUA}${BOLD}FPS: ${fpsColor}${fps} ${AQUA}fps`;
}).setDelay(1);

export function getStatus(status) {
    switch (status) {
        case "ping":
            const pingColor = ping < 100 ? GREEN :
                ping < 200 ? DARK_GREEN :
                ping < 300 ? YELLOW :
                ping < 400 ? GOLD : RED;
            ChatLib.chat(`${LOGO} ${DARK_AQUA}Ping: ${pingColor}${ping} ${AQUA}ms`);
            break;
        case "tps":
            const tpsColor = tps > 19 ? GREEN :
                tps > 16 ? DARK_GREEN :
                tps > 13 ? YELLOW :
                tps > 10 ? GOLD : RED;
            ChatLib.chat(`${LOGO} ${DARK_AQUA}TPS: ${tpsColor}${tps.toFixed(1)} ${AQUA}tps`);
            break;
        case "fps":
            const fps = Client.getFPS();
            const fpsRatio = fps / maxFps;
            const fpsColor = fpsRatio > 0.9 ? GREEN :
                fpsRatio > 0.8 ? DARK_GREEN :
                fpsRatio > 0.7 ? YELLOW :
                fpsRatio > 0.6 ? GOLD : RED;
            ChatLib.chat(`${LOGO} ${DARK_AQUA}FPS: ${fpsColor}${fps} ${AQUA}fps`);
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
    if ((settings.hideFarEntity === 0 || distance < settings.hideFarEntity) && 
        (settings.hideCloseEntity === 0 || distance > settings.hideCloseEntity)) return;
    cancel(event);
}), () => {
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
}), () => settings.hideParticles === true);
