import { AQUA, BOLD, DARK_PURPLE, DARK_RED, GHAST_CLASS, GRAY, GREEN, MUSIC, RED, WHITE } from "../../utils/Constants";
import location from "../../utils/Location";
import { registerWhen } from "../../utils/RegisterTils";
import Settings from "../../utils/Settings";
import { setTitle } from "../../utils/Title";
import Toggles from "../../utils/Toggles";
import { playSound } from "../../utils/functions/misc";

/**
 * No key alert.
 */
registerWhen(
  register("chat", () => {
    setTitle(`${BOLD}NO KUUDRA KEY!`, "", 10, 50, 10, 60);
  }).setCriteria(
    "WARNING: You do not have a key for this tier in your inventory, you will not be able to claim rewards."
  ),
  () => location.getWorld() === "Kuudra" && Settings.kuudraAlerts && Toggles.keyAlert
);

/**
 * Unready alert.
 */
registerWhen(
  register("chat", (player) => {
    const name = player.removeFormatting().toUpperCase();
    playSound(MUSIC, 1000);
    setTitle(`${DARK_RED + BOLD + name} ${WHITE}IS NO LONGER READY!`, "", 10, 50, 10, 61);
  }).setCriteria("${player} is no longer ready!"),
  () => location.getWorld() === "Kuudra" && Toggles.kuudraAlerts && Toggles.unreadyAlert
);

/**
 * Choose perk alert.
 */
registerWhen(
  register("chat", () => {
    playSound(MUSIC, 1000);
    setTitle(`${AQUA + BOLD}BUY UPGRADE ROUTE!`, "", 10, 100, 10, 62);
  }).setCriteria("[NPC] Elle: Okay adventurers, I will go and fish up Kuudra!"),
  () => location.getWorld() === "Kuudra" && Settings.kuudraAlerts && Toggles.routeAlert
);

/**
 * Supply spawned alert.
 */
registerWhen(
  register("chat", () => {
    playSound(MUSIC, 1000);
    setTitle(`${AQUA + BOLD}PICKUP SUPPLY!`, "", 10, 100, 10, 63);
  }).setCriteria("[NPC] Elle: Not again!"),
  () => location.getWorld() === "Kuudra" && Settings.kuudraAlerts && Toggles.supplyAlert
);

/**
 * Building started alert.
 */
registerWhen(
  register("chat", () => {
    playSound(MUSIC, 1000);
    setTitle(`${AQUA + BOLD}START BUILDING!`, "", 10, 50, 10, 64);
  }).setCriteria("[NPC] Elle: It's time to build the Ballista again! Cover me!"),
  () => location.getWorld() === "Kuudra" && Settings.kuudraAlerts && Toggles.buildingAlert
);

/**
 * Fresh tools alert.
 */
registerWhen(
  register("chat", () => {
    playSound(MUSIC, 1000);
    setTitle(`${GREEN + BOLD}EAT FRESH!`, "", 10, 50, 10, 65);
  }).setCriteria("Your Fresh Tools Perk bonus doubles your building speed for the next ${time} seconds!"),
  () => location.getWorld() === "Kuudra" && Settings.kuudraAlerts && Toggles.freshAlert
);

/**
 * Fuel spawned alert.
 */
registerWhen(
  register("chat", (player, percentage) => {
    // Ballista full alert
    playSound(MUSIC, 1000);
    switch (percentage) {
      case "100":
        setTitle(`${AQUA + BOLD}100% ${GRAY}[${GREEN}||||${GRAY}]`, "", 10, 100, 10, 66);
        break;
      case "75":
        setTitle(`${AQUA + BOLD}75% ${GRAY}[${GREEN}|||${RED}|${GRAY}]`, "", 10, 50, 10, 66);
        break;
      case "50":
        setTitle(`${AQUA + BOLD}50% ${GRAY}[${GREEN}||${RED}||${GRAY}]`, "", 10, 50, 10, 66);
        break;
      case "25":
        setTitle(`${AQUA + BOLD}25% ${GRAY}[${GREEN}|${RED}|||${GRAY}]`, "", 10, 50, 10, 66);
        break;
    }
  }).setCriteria("${player} recovered a Fuel Cell and charged the Ballista! (${percentage}%)"),
  () => location.getWorld() === "Kuudra" && Settings.kuudraAlerts && Toggles.fuelAlert
);

/**
 * Stunner eaten alert.
 */
registerWhen(
  register("chat", (player) => {
    const ign = player.toUpperCase();
    const stunner = Toggles.kuudraStunner.toUpperCase();

    if (!ign.equals("ELLE") && (stunner === "ALL" || ign.equals(stunner))) {
      playSound(MUSIC, 1000);
      setTitle(`${GREEN + BOLD + ign} WAS EATEN!`, "", 10, 100, 10, 67);
    }
  }).setCriteria("${player} has been eaten by Kuudra!"),
  () => location.getWorld() === "Kuudra" && Settings.kuudraAlerts && Toggles.kuudraStunner !== ""
);

/**
 * Ballista mounted alert.
 */
registerWhen(
  register("chat", (player) => {
    const ign = player.toUpperCase();
    const cannonear = Toggles.kuudraCannonear.toUpperCase();

    if (cannonear === "" || cannonear === "ALL" || ign.equals(cannonear)) {
      playSound(MUSIC, 1000);
      setTitle(`${AQUA + BOLD + ign} ASSUMED THE POSITION!`, "", 10, 100, 10, 68);
    }
  }).setCriteria("${player} mounted a Cannon!"),
  () => location.getWorld() === "Kuudra" && Settings.kuudraAlerts && Toggles.ballistaAlert !== ""
);

/**
 * Kuudra stunned alert.
 */
registerWhen(
  register("chat", () => {
    playSound(MUSIC, 1000);
    setTitle(`${GREEN + BOLD}KUUDRA STUNNED!`, "", 10, 100, 10, 69);
  }).setCriteria("{player} destroyed one of Kuudra's pods!"),
  () => location.getWorld() === "Kuudra" && Settings.kuudraAlerts && Toggles.stunAlert
);

/**
 * Warns player about dropship as they get close to center.
 */
let alerted = false;
registerWhen(
  register("step", () => {
    const dropships = World.getAllEntitiesOfType(GHAST_CLASS).find((ghast) => {
      distance = Math.hypot(ghast.getX() + 101, ghast.getZ() + 105);
      return distance < 20 && distance > 10;
    });

    if (dropships !== undefined) setTitle(`${RED + BOLD}ART IS AN EXPLOSION!`, "", 0, 50, 5, 71);
  }).setFps(1),
  () => location.getWorld() === "Kuudra" && Settings.kuudraAlerts && Toggles.dropshipAlert
);

/**
 * Alerts player when token gathered surpasses set threshhold.
 */
registerWhen(
  register("step", () => {
    if (alerted) return;
    tokens = Scoreboard?.getLines()?.find((line) => line.getName().includes("Tokens"));
    if (tokens === undefined) return;

    tokens = tokens.getName().removeFormatting().replace(/\D/g, "");
    if (tokens >= Math.round(Toggles.tokenAlert / 10) * 10) {
      setTitle(`${BOLD + tokens} ${DARK_PURPLE + BOLD}TOKENS GATHERED!`, "", 0, 50, 5, 70);
      alerted = true;
    }
  }).setFps(5),
  () => location.getWorld() === "Kuudra" && Settings.kuudraAlerts && Toggles.tokenAlert !== 0
);
register("worldLoad", () => {
  alerted = false;
});
