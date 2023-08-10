// Import settings, constants, overlay, and variables
import settings from "../../settings";
import { BOLD, DARK_GREEN, GREEN, WHITE } from "../../utils/constants";
import { Overlay } from "../../utils/overlay";
import { data, registerWhen } from "../../utils/variables";

// Java packet types
let S03PacketTimeUpdate = Java.type('net.minecraft.network.play.server.S03PacketTimeUpdate');
let S37PacketStatistics = Java.type('net.minecraft.network.play.server.S37PacketStatistics');
let C16PacketClientStatus = Java.type('net.minecraft.network.play.client.C16PacketClientStatus');
let S01PacketJoinGame = Java.type('net.minecraft.network.play.server.S01PacketJoinGame');

// TPS
let tps = 20;
let pastDate = 0;

// Calculate TPS
registerWhen(register('packetReceived', () => {
    if (pastDate !== null) {
        const time = Date.now() - pastDate;
        const instantTps = Math.min(20000 / time, 20);
        const alpha = 2 / 11;
        tps = instantTps * alpha + tps * (1 - alpha);
    }
    pastDate = Date.now();
}).setFilteredClass(S03PacketTimeUpdate), () => settings.serverStatus);

// Ping
let ping = 0;
let lastPing = 0;

function sendPingRequest() {
    if (lastPing === 0) {
        Client.sendPacket(new C16PacketClientStatus(C16PacketClientStatus.EnumState.REQUEST_STATS));
        lastPing = Date.now();
    }
};

function calculatePing() {
    if (lastPing !== 0) {
        ping = Math.abs(Date.now() - lastPing);
        lastPing = 0;
    }
};

register("step", () => {
    sendPingRequest();
}).setDelay(3);

registerWhen(register('packetReceived', () => {
    calculatePing();
}).setFilteredClasses([S01PacketJoinGame, S37PacketStatistics]), () => settings.serverStatus);


// Create and update the status overlay
const statusExample = `${DARK_GREEN}${BOLD}Ping: ${WHITE}Peek
${DARK_GREEN}${BOLD}TPS: ${WHITE}A
${DARK_GREEN}${BOLD}FPS: ${WHITE}Boo`;
const statusOverlay = new Overlay("serverStatus", ["all"], data.LL, "moveStatus", statusExample);

register('step', () => {
    statusOverlay.message = 
`${DARK_GREEN}${BOLD}Ping: ${WHITE}${ping}${GREEN} ms
${DARK_GREEN}${BOLD}TPS: ${WHITE}${tps.toFixed(1)} ${GREEN}tps
${DARK_GREEN}${BOLD}FPS: ${WHITE}${Client.getFPS()} ${GREEN}fps`;
}).setDelay(1);
