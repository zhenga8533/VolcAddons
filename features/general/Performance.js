import {
  AQUA,
  BLACK,
  BLUE,
  BOLD,
  DARK_AQUA,
  DARK_BLUE,
  DARK_GRAY,
  DARK_GREEN,
  DARK_PURPLE,
  DARK_RED,
  GOLD,
  GRAY,
  GREEN,
  LIGHT_PURPLE,
  LOGO,
  RED,
  WHITE,
  YELLOW,
} from "../../utils/Constants";
import { data } from "../../utils/Data";
import location from "../../utils/Location";
import { Overlay } from "../../utils/Overlay";
import { registerWhen } from "../../utils/RegisterTils";
import Settings from "../../utils/Settings";
import Toggles from "../../utils/Toggles";
import { isPlayer } from "../../utils/functions/player";

/**
 * Java packet types.
 */
const SETTINGS = Client.settings.getSettings();
let S03PacketTimeUpdate = Java.type("net.minecraft.network.play.server.S03PacketTimeUpdate");
let S37PacketStatistics = Java.type("net.minecraft.network.play.server.S37PacketStatistics");
let C16PacketClientStatus = Java.type("net.minecraft.network.play.client.C16PacketClientStatus");
let S01PacketJoinGame = Java.type("net.minecraft.network.play.server.S01PacketJoinGame");

/**
 * Variables used to represent TPS data.
 */
let tps = 20;
export function getTPS() {
  return tps;
}
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
// In case not CT 2.2.0
try {
  register("packetReceived", () => {
    calcTPS();
  }).setFilteredClass(S03PacketTimeUpdate);
} catch (err) {
  register("packetReceived", (packet) => {
    if (packet !== S03PacketTimeUpdate) return;
    calcTPS();
  });
}

/**
 * Variables used to represent ping data.
 */
let ping = 0;
export function getPing() {
  return ping;
}
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
}
registerWhen(
  register("step", () => {
    sendPingRequest();
  }).setDelay(3),
  () => Settings.serverStatus || Toggles.statusCommand
);

/**
 * Calculates the ping (latency) based on the difference between the current time
 * and the time when the last ping request was sent. Updates the `ping` value and resets `lastPing`.
 */
function calculatePing() {
  if (lastPing !== 0) {
    ping = Math.abs(Date.now() - lastPing);
    lastPing = 0;
  }
}
// In case not CT 2.2.0
try {
  register("packetReceived", () => {
    calculatePing();
  }).setFilteredClasses([S01PacketJoinGame, S37PacketStatistics]);
} catch (err) {
  register("packetReceived", (packet) => {
    if (packet !== S01PacketJoinGame || packet !== S37PacketStatistics) return;
    calculatePing();
  });
}

/**
 * Variables used to represent and display player status.
 */
const statusExample = `${DARK_AQUA + BOLD}XYZ: ${GREEN}-195, 88, 58
${DARK_AQUA + BOLD}Y/P: ${AQUA}-89.15 / 30.89
${DARK_AQUA + BOLD}Dir: ${AQUA}East
${DARK_AQUA + BOLD}Ping: ${GREEN}58 ${AQUA}ms
${DARK_AQUA + BOLD}FPS: ${GREEN}60 ${AQUA}fps
${DARK_AQUA + BOLD}TPS: ${GREEN}19.8 ${AQUA}tps
${DARK_AQUA + BOLD}CPS: ${GREEN}0 ${AQUA}: ${GREEN}0
${DARK_AQUA + BOLD}Day: ${AQUA}0.75`;
const statusOverlay = new Overlay("serverStatus", data.LL, "moveStatus", statusExample);

/**
 * Updates the status overlay message with the current ping, TPS, and FPS information.
 * Constructs a formatted message containing the ping in milliseconds, TPS in ticks per second,
 * and FPS (frames per second) using the values from the `ping`, `tps`, and `Client.getFPS()` respectively.
 */
registerWhen(
  register("tick", () => {
    let statusMessage = "";
    const statusColor = [
      BLACK,
      DARK_BLUE,
      DARK_GREEN,
      DARK_AQUA,
      DARK_RED,
      DARK_PURPLE,
      GOLD,
      GRAY,
      DARK_GRAY,
      BLUE,
      GREEN,
      AQUA,
      RED,
      LIGHT_PURPLE,
      YELLOW,
      WHITE,
    ][Toggles.statusColor];

    // XYZ
    if (Toggles.xyzDisplay) {
      const x = Math.round(Player.getX());
      const y = Math.round(Player.getY());
      const z = Math.round(Player.getZ());
      statusMessage += `\n${GRAY}[${GOLD}XYZ${GRAY}] ${statusColor + x}, ${y}, ${z}`;
    }

    // Yaw and Pitch
    if (Toggles.angleDisplay === 1 || Toggles.angleDisplay === 3) {
      const yaw = Player.getYaw();
      const pitch = Player.getPitch();
      statusMessage += `\n${GRAY}[${GOLD}Y/P${GRAY}] ${statusColor + yaw.toFixed(2)} / ${pitch.toFixed(2)}`;
    }

    // Direction
    if (Toggles.dirDisplay) {
      const yaw = (Player.getYaw() + 360) % 360;
      const direction =
        yaw >= 45 && yaw < 135
          ? "West"
          : yaw >= 135 && yaw < 255
          ? "North"
          : yaw >= 225 && yaw < 315
          ? "East"
          : "South";
      statusMessage += `\n${GRAY}[${GOLD}Dir${GRAY}] ${statusColor + direction}`;
    }

    // Ping
    if (Toggles.pingDisplay) {
      const pingColor =
        ping < 100
          ? GREEN
          : ping < 200
          ? DARK_GREEN
          : ping < 300
          ? YELLOW
          : ping < 420
          ? GOLD
          : ping < 690
          ? RED
          : DARK_RED;
      statusMessage += `\n${GRAY}[${GOLD}Ping${GRAY}] ${pingColor + ping + statusColor} ms`;
    }

    // FPS
    if (Toggles.fpsDisplay) {
      const fps = Client.getFPS();
      const fpsMax = SETTINGS.field_74350_i;
      const fpsRatio = fps / fpsMax;
      const fpsColor =
        fpsMax >= 260 || fpsRatio > 0.9
          ? GREEN
          : fpsRatio > 0.8
          ? DARK_GREEN
          : fpsRatio > 0.7
          ? YELLOW
          : fpsRatio > 0.6
          ? GOLD
          : fpsRatio > 0.5
          ? RED
          : DARK_RED;
      statusMessage += `\n${GRAY}[${GOLD}FPS${GRAY}] ${fpsColor + fps + statusColor} fps`;
    }

    // TPS
    if (Toggles.tpsDisplay) {
      const tpsColor =
        tps > 19 ? GREEN : tps > 16 ? DARK_GREEN : tps > 13 ? YELLOW : tps > 10 ? GOLD : tps > 7 ? RED : DARK_RED;
      statusMessage += `\n${GRAY}[${GOLD}TPS${GRAY}] ${tpsColor + tps.toFixed(1) + statusColor} tps`;
    }

    // CPS
    if (Toggles.cpsDisplay) {
      const leftCPS = CPS.getLeftClicks();
      const leftColor =
        leftCPS < 3
          ? GREEN
          : leftCPS < 7
          ? DARK_GREEN
          : leftCPS < 13
          ? YELLOW
          : leftCPS < 21
          ? GOLD
          : leftCPS < 30
          ? RED
          : DARK_RED;
      const rightCPS = CPS.getRightClicks();
      const rightColor =
        rightCPS < 3
          ? GREEN
          : rightCPS < 7
          ? DARK_GREEN
          : rightCPS < 13
          ? YELLOW
          : rightCPS < 21
          ? GOLD
          : rightCPS < 30
          ? RED
          : DARK_RED;
      statusMessage += `\n${GRAY}[${GOLD}CPS${GRAY}] ${leftColor + leftCPS + statusColor} : ${rightColor + rightCPS}`;
    }

    // Day
    if (Toggles.dayDisplay) {
      const daytime = (World.getTime() / 24000).toFixed(2);
      statusMessage += `\n${GRAY}[${GOLD}Day${GRAY}] ${statusColor + daytime}`;
    }

    statusOverlay.setMessage(statusMessage.substring(1));
  }),
  () => Settings.serverStatus || Toggles.statusCommand
);

/**
 * Output status to user chat when user requests via command args.
 *
 * @param {String} status - Status type to retrieve.
 */
export function getStatus(status) {
  switch (status) {
    case "ping":
      const pingColor =
        ping < 100
          ? GREEN
          : ping < 200
          ? DARK_GREEN
          : ping < 300
          ? YELLOW
          : ping < 420
          ? GOLD
          : ping < 690
          ? RED
          : DARK_RED;
      ChatLib.chat(`${LOGO + DARK_AQUA + BOLD}Ping: ${pingColor + ping + AQUA} ms`);
      break;
    case "fps":
      const fps = Client.getFPS();
      const fpsRatio = fps / SETTINGS.field_74350_i;
      const fpsColor =
        fpsRatio > 0.9
          ? GREEN
          : fpsRatio > 0.8
          ? DARK_GREEN
          : fpsRatio > 0.7
          ? YELLOW
          : fpsRatio > 0.6
          ? GOLD
          : fpsRatio > 0.5
          ? RED
          : DARK_RED;
      ChatLib.chat(`${LOGO + DARK_AQUA + BOLD}FPS: ${fpsColor + fps + AQUA} fps`);
      break;
    case "tps":
      const tpsColor =
        tps > 19 ? GREEN : tps > 16 ? DARK_GREEN : tps > 13 ? YELLOW : tps > 10 ? GOLD : tps > 7 ? RED : DARK_RED;
      ChatLib.chat(`${LOGO + DARK_AQUA + BOLD}TPS: ${tpsColor + tps.toFixed(1) + AQUA} tps`);
      break;
    case "cps":
      const leftCPS = CPS.getLeftClicks();
      const leftColor =
        leftCPS < 3
          ? GREEN
          : leftCPS < 7
          ? DARK_GREEN
          : leftCPS < 13
          ? YELLOW
          : leftCPS < 21
          ? GOLD
          : leftCPS < 30
          ? RED
          : DARK_RED;
      const rightCPS = CPS.getRightClicks();
      const rightColor =
        rightCPS < 3
          ? GREEN
          : rightCPS < 7
          ? DARK_GREEN
          : rightCPS < 13
          ? YELLOW
          : rightCPS < 21
          ? GOLD
          : rightCPS < 30
          ? RED
          : DARK_RED;

      ChatLib.chat(`${LOGO + DARK_AQUA + BOLD}CPS: ${leftColor + leftCPS + AQUA} : ${rightColor + rightCPS}`);
      break;
    case "yaw":
      ChatLib.chat(`${LOGO + DARK_AQUA + BOLD}Yaw: ${AQUA + Player.getYaw()}°`);
      break;
    case "pitch":
      ChatLib.chat(`${LOGO + DARK_AQUA + BOLD}Pitch: ${AQUA + Player.getPitch()}°`);
      break;
    case "dir":
    case "direction":
      const yaw = (Player.getYaw() + 360) % 360;
      const direction =
        yaw >= 45 && yaw < 135
          ? "West"
          : yaw >= 135 && yaw < 255
          ? "North"
          : yaw >= 225 && yaw < 315
          ? "East"
          : "South";
      ChatLib.chat(`${LOGO + DARK_AQUA + BOLD}Dir: ${AQUA + direction}`);
      break;
    case "day":
      const daytime = (World.getTime() / 24000).toFixed(2);
      ChatLib.chat(`${DARK_AQUA + BOLD}Day: ${AQUA + daytime}`);
      break;
  }
}

/**
 * Crosshair
 */
registerWhen(
  register("renderCrosshair", () => {
    const yaw = Player.getYaw().toFixed(2);
    const pitch = Player.getPitch().toFixed(2);
    const height = Renderer.screen.getHeight();
    const width = Renderer.screen.getWidth();
    const offset = (9 * Renderer.screen.getScale()) / 2 + Renderer.screen.getScale();

    Renderer.drawString(GRAY + yaw, width / 2 + offset, height / 2 - 4.5, true);
    Renderer.drawString(GRAY + pitch, (width - Renderer.getStringWidth(pitch)) / 2, height / 2 + offset, true);
  }),
  () => Toggles.angleDisplay > 1
);

/**
 * Check entity distance to player. Hide if too close or far.
 */
registerWhen(
  register("renderEntity", (entity, _, __, event) => {
    const distance = entity.distanceTo(Player.asPlayerMP());
    if (Settings.hideFarEntity !== 0 && distance >= Settings.hideFarEntity) cancel(event);
    if (
      Settings.hideCloseEntity !== 0 &&
      distance <= Settings.hideCloseEntity &&
      entity.name !== Player.name &&
      isPlayer(entity)
    )
      cancel(event);
  }).setPriority(Priority.LOWEST),
  () => {
    if (Settings.hideFarEntity === 0 && Settings.hideCloseEntity === 0) return false;
    const world = location.getWorld()?.toLowerCase() ?? "";
    const worlds = Settings.hideWorlds.toLowerCase().split(", ");
    return worlds[0] === "" || worlds.includes(world);
  }
);

/**
 * Prevents any particles from rendering.
 */
registerWhen(
  register("spawnParticle", (particle, type, event) => {
    cancel(event);
  }).setPriority(Priority.LOWEST),
  () => Settings.hideParticles
);
