import { AQUA, BOLD, DARK_AQUA, DARK_PURPLE, EntityArmorStand, GOLD, PLAYER_CLASS, SMA } from "../../utils/Constants";
import { data } from "../../utils/Data";
import location from "../../utils/Location";
import { Overlay } from "../../utils/Overlay";
import party from "../../utils/Party";
import { registerWhen } from "../../utils/RegisterTils";
import Settings from "../../utils/Settings";
import Waypoint from "../../utils/Waypoint";
import { getSlayerBoss } from "../combat/SlayerDetect";

/**
 * Variables used to track and display vampire boss attacks.
 */
const vampireExample = `${DARK_PURPLE + BOLD}MANIA: ${AQUA}Dracule
${GOLD + BOLD}TWINCLAWS: ${AQUA}Mihawk
${DARK_AQUA + BOLD}ICHOR: ${AQUA}3,590,000,000`;
const vampireOverlay = new Overlay("vampireAttack", data.BL, "moveVamp", vampireExample, ["The Rift"]);
let bossUUID = 0;
let ichorUUID = 0;
let ichorSpawn = false;
let mania = 0;
let inMania = false;

/**
 * Tracks player boss on spawn and updates vampire attack overlay every tick.
 */
registerWhen(
  register("tick", () => {
    let vampireMessage = "";
    vampireOverlay.setMessage("");
    if (!getSlayerBoss()) {
      bossUUID = 0;
      mania = 0;
      return;
    }

    const player = Player.asPlayerMP().getEntity();
    const stands = World.getWorld()
      .func_72839_b(player, player.func_174813_aQ().func_72314_b(16, 16, 16))
      .filter((entity) => entity instanceof EntityArmorStand);

    // Boss Nametag Shit
    if (!bossUUID) {
      const spawn = stands.find((stand) => stand.func_95999_t().includes("03:59"));
      if (spawn === undefined) return;
      bossUUID = spawn.persistentID;
    } else {
      const boss = stands.find((stand) => stand.persistentID === bossUUID);
      if (boss === undefined) return;
      const name = boss.func_95999_t().split(" ");

      // Mania Detect
      const maniaIndex = name.indexOf("§5§lMANIA");
      if (maniaIndex !== -1) {
        vampireMessage += `${name[maniaIndex]}: ${name[maniaIndex + 1]}\n`;
        if (!inMania) {
          mania++;
          inMania = true;

          const pX = Math.round(Player.getX());
          const PY = Math.round(Player.getY());
          const PZ = Math.round(Player.getZ());
          if (Settings.announceMania === 1) {
            const id = (Math.random() + 1).toString(36).substring(6);
            ChatLib.command(`ac x: ${pX}, y: ${PY}, z: ${PZ} | MANIA: ${mania}! @${id}`);
          } else if (party.getIn() && Settings.announceMania === 2)
            ChatLib.command(`pc x: ${pX}, y: ${PY}, z: ${PZ} | MANIA: ${mania}!`);
        }
      } else inMania = false;

      // Twinclaw Detect
      const clawIndex = name.indexOf("§6§lTWINCLAWS");
      if (clawIndex !== -1) vampireMessage += `${name[clawIndex]}: ${name[clawIndex + 1]}\n`;

      // Ichor Detect
      const ichorIndex = name.indexOf("§3§lICHOR");
      if (ichorIndex !== -1) ichorSpawn = true;

      vampireOverlay.setMessage(vampireMessage);
    }

    // Ichor Nametag Shit
    if (ichorSpawn) {
      if (ichorUUID !== 0) {
        const ichor = stands.find((stand) => stand.persistentID === ichorUUID);
        if (ichor === undefined) {
          ichorSpawn = false;
          ichorUUID = 0;
          return;
        }
        vampireOverlay.setMessage(vampireMessage + `${DARK_AQUA + BOLD}ICHOR: ${ichor.func_95999_t()}\n`);
      } else {
        const ichor = stands.find((stand) => stand.func_95999_t().includes("24."));
        if (ichor === undefined) return;
        ichorUUID = ichor.persistentID;
      }
    }
  }),
  () => location.getWorld() === "The Rift" && (Settings.vampireAttack || Settings.announceMania !== 0)
);

/**
 * Highlights vampire bosses with steakable HP.
 */
const VAMP_HP = new Set([625, 1100, 1800, 2400, 3000]);
const draculaWaypoints = new Waypoint([1, 0, 0], 2, true, true, false);
const vampWaypoints = new Waypoint([1, 0, 0], 2, true, true, false);

registerWhen(
  register("step", () => {
    draculaWaypoints.clear();
    vampWaypoints.clear();

    World.getAllEntitiesOfType(PLAYER_CLASS).forEach((mob) => {
      const entity = mob.getEntity();
      const max = entity.func_110148_a(SMA.field_111267_a).func_111125_b();

      if (max > 210 && entity.func_110143_aJ() / max <= 0.2) vampWaypoints.push([RED + "Dracule", mob]);
      else if (VAMP_HP.has(max)) draculaWaypoints.push([RED + "Mihawk", mob]);
    });
  }).setFps(2),
  () => location.getWorld() === "The Rift" && Settings.vampireHitbox
);

/**
 * Variables used to reprsent and track the 6 effigies.
 */
const EFFIGIES = [
  ["1st Effigy", 151, 73, 96],
  ["2nd Effigy", 194, 87, 120],
  ["3rd Effigy", 236, 104, 148],
  ["4th Effigy", 294, 90, 135],
  ["5th Effigy", 263, 93, 95],
  ["6th Effigy", 241, 123, 119],
];
const missingEffigies = new Waypoint([0.75, 0.75, 0.75]); // Silver effigies

/**
 * Tracks missing effigies and makes a waypoint to them.
 */
registerWhen(
  register("step", () => {
    missingEffigies.clear();
    let effigies = Scoreboard?.getLines()?.find((line) => line.getName().includes("Effigies"));
    if (effigies === undefined) return;

    effigies = effigies
      .getName()
      .replace(/[^§7⧯]/g, "")
      .split("§");
    effigies.shift();
    effigies.forEach((effigy, i) => {
      if (effigy.includes("7")) missingEffigies.push(EFFIGIES[i]);
    });
  }).setFps(1),
  () => location.getWorld() === "The Rift" && Settings.effigyWaypoint
);
