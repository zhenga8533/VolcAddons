import settings from "../../settings";
import { BOLD, DARK_GREEN, GREEN, WHITE } from "../../utils/constants";
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
    registerWhen(register('packetReceived', () => {
        calcTPS()
    }).setFilteredClass(S03PacketTimeUpdate), () => settings.serverStatus === true);
} catch (err) {
    registerWhen(register('packetReceived', (packet) => {
        if (packet !== S03PacketTimeUpdate) return;
        calcTPS();
    }), () => settings.serverStatus === true);
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
    registerWhen(register('packetReceived', () => {
        calculatePing();
    }).setFilteredClasses([S01PacketJoinGame, S37PacketStatistics]), () => settings.serverStatus === true);
} catch (err) {
    registerWhen(register('packetReceived', () => {
        if (packet !== S01PacketJoinGame || packet !== S37PacketStatistics) return;
        calculatePing();
    }), () => settings.serverStatus === true);
}


/**
 * Variables used to represent and display player status.
 */
const statusExample = `${DARK_GREEN}${BOLD}Ping: ${WHITE}Peek
${DARK_GREEN}${BOLD}TPS: ${WHITE}A
${DARK_GREEN}${BOLD}FPS: ${WHITE}Boo`;
const statusOverlay = new Overlay("serverStatus", ["all"], () => true, data.LL, "moveStatus", statusExample);

/**
 * Updates the status overlay message with the current ping, TPS, and FPS information.
 * Constructs a formatted message containing the ping in milliseconds, TPS in ticks per second,
 * and FPS (frames per second) using the values from the `ping`, `tps`, and `Client.getFPS()` respectively.
 */
register('step', () => {
    statusOverlay.message = 
`${DARK_GREEN}${BOLD}Ping: ${WHITE}${ping} ${GREEN}ms
${DARK_GREEN}${BOLD}TPS: ${WHITE}${tps.toFixed(1)} ${GREEN}tps
${DARK_GREEN}${BOLD}FPS: ${WHITE}${Client.getFPS()} ${GREEN}fps`;
}).setDelay(1);





/**
 * Check entity distance to player. Hide if too close.
 * 
 * @param {Entity} entity - The entity being checked.
 * @param {Position} pos - The entity's position.
 * @param {number} tick - The current tick.
 * @param {Event} event - The event being handled.
 */
registerWhen(register("renderEntity", (entity, pos, tick, event) => {
    if (entity.distanceTo(Player.asPlayerMP()) < settings.hideEntity) return;
    cancel(event);
}), () => settings.hideEntity !== 0 && (settings.hideWorlds === "" || settings.hideWorlds.split(", ").includes(getWorld())));
