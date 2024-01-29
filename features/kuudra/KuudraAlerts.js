import settings from "../../utils/settings";
import toggles from "../../utils/toggles";
import {AQUA, BOLD, DARK_PURPLE, DARK_RED, GHAST_CLASS, GRAY, GREEN, MUSIC, RED, WHITE} from "../../utils/constants";
import { playSound } from "../../utils/functions/misc";
import { registerWhen } from "../../utils/variables";
import { getWorld } from "../../utils/worlds";


/**
 * No key alert.
 */
registerWhen(register("chat", () => {
    Client.showTitle(`${BOLD}NO KUUDRA KEY!`, "", 10, 50, 10);
}).setCriteria("WARNING: You do not have a key for this tier in your inventory, you will not be able to claim rewards."),
() => getWorld() === "Kuudra" && settings.kuudraAlerts && toggles.keyAlert);

/**
 * Unready alert.
 */
registerWhen(register("chat", (player) => {
    const name = player.removeFormatting().toUpperCase();
    playSound(MUSIC, 1000);
    Client.showTitle(`${DARK_RED + BOLD + name} ${WHITE}IS NO LONGER READY!`, "", 10, 50, 10);
}).setCriteria("${player} is no longer ready!"), () => getWorld() === "Kuudra" && toggles.kuudraAlerts && toggles.unreadyAlert);

/**
 * Choose perk alert.
 */
registerWhen(register("chat", () => {
    playSound(MUSIC, 1000);
    Client.showTitle(`${AQUA + BOLD}BUY UPGRADE ROUTE!`, "", 10, 100, 10);
}).setCriteria("[NPC] Elle: Okay adventurers, I will go and fish up Kuudra!"),
() => getWorld() === "Kuudra" && settings.kuudraAlerts && toggles.routeAlert);

/**
 * Supply spawned alert.
 */
registerWhen(register("chat", () => {
    playSound(MUSIC, 1000);
    Client.showTitle(`${AQUA + BOLD}PICKUP SUPPLY!`, "", 10, 100, 10);
}).setCriteria("[NPC] Elle: Not again!"), () => getWorld() === "Kuudra" && settings.kuudraAlerts && toggles.supplyAlert);

/**
 * Building started alert.
 */
registerWhen(register("chat", () => {
    playSound(MUSIC, 1000);
    Client.showTitle(`${AQUA + BOLD}START BUILDING!`, "", 10, 50, 10);
}).setCriteria("[NPC] Elle: It's time to build the Ballista again! Cover me!"),
() => getWorld() === "Kuudra" && settings.kuudraAlerts && toggles.buildingAlert);

/**
 * Fresh tools alert.
 */
registerWhen(register("chat", () => {
    playSound(MUSIC, 1000);
    Client.showTitle(`${GREEN + BOLD}EAT FRESH!`, "", 10, 50, 10);
}).setCriteria("Your Fresh Tools Perk bonus doubles your building speed for the next ${time} seconds!"),
() => getWorld() === "Kuudra" && settings.kuudraAlerts && toggles.freshAlert);

/**
 * Fuel spawned alert.
 */
registerWhen(register("chat", (player, percentage) => {  // Ballista full alert
    playSound(MUSIC, 1000);
    switch (percentage) {
        case "100":
            Client.showTitle(`${AQUA + BOLD}100% ${GRAY}[${GREEN}||||${GRAY}]`, "", 10, 100, 10);
            break;
        case "75":
            Client.showTitle(`${AQUA + BOLD}75% ${GRAY}[${GREEN}|||${RED}|${GRAY}]`, "", 10, 50, 10);
            break;
        case "50":
            Client.showTitle(`${AQUA + BOLD}50% ${GRAY}[${GREEN}||${RED}||${GRAY}]`, "", 10, 50, 10);
            break;
        case "25":
            Client.showTitle(`${AQUA + BOLD}25% ${GRAY}[${GREEN}|${RED}|||${GRAY}]`, "", 10, 50, 10);
            break;
    }
}).setCriteria("${player} recovered a Fuel Cell and charged the Ballista! (${percentage}%)"),
() => getWorld() === "Kuudra" && settings.kuudraAlerts && toggles.fuelAlert);

/**
 * Stunner eaten alert.
 */
registerWhen(register("chat", (player) => {
    const ign = player.toUpperCase();
    const stunner = toggles.kuudraStunner.toUpperCase();

    if (!ign.equals("ELLE") && (stunner === "ALL" || ign.equals(stunner))) {
        playSound(MUSIC, 1000);
        Client.showTitle(`${GREEN + BOLD + ign} WAS EATEN!`, "", 10, 100, 10);
    }
}).setCriteria("${player} has been eaten by Kuudra!"),
() => getWorld() === "Kuudra" && settings.kuudraAlerts && toggles.kuudraStunner !== "");

/**
 * Ballista mounted alert.
 */
registerWhen(register("chat", (player) => {
    const ign = player.toUpperCase();
    const cannonear = toggles.kuudraCannonear.toUpperCase();

    if (cannonear === "" || (cannonear === "ALL" || ign.equals(cannonear))) {
        playSound(MUSIC, 1000);
        Client.showTitle(`${AQUA + BOLD + ign} ASSUMED THE POSITION!`, "", 10, 100, 10);
    }
}).setCriteria("${player} mounted a Cannon!"),
() => getWorld() === "Kuudra" && settings.kuudraAlerts && toggles.ballistaAlert !== "");

/**
 * Kuudra stunned alert.
 */
registerWhen(register("chat", () => {
    playSound(MUSIC, 1000);
    Client.showTitle(`${GREEN + BOLD}KUUDRA STUNNED!`, "", 10, 100, 10);
}).setCriteria("{player} destroyed one of Kuudra's pods!"),
() => getWorld() === "Kuudra" && settings.kuudraAlerts && toggles.stunAlert);

/**
 * Warns player about dropship as they get close to center.
 */
let alerted = false
registerWhen(register("step", () => {
    const dropships = World.getAllEntitiesOfType(GHAST_CLASS).find(ghast => {
        distance = Math.hypot(ghast.getX() + 101, ghast.getZ() + 105);
        return distance < 20 && distance > 10;
    });

    if (dropships !== undefined) Client.showTitle(`${RED + BOLD}ART IS AN EXPLOSION!`, "", 0, 50, 5);
}).setFps(1), () => getWorld() === "Kuudra" && settings.kuudraAlerts && toggles.dropshipAlert);

/**
 * Alerts player when token gathered surpasses set threshhold.
 */
registerWhen(register("step", () => {
    if (alerted) return;
    tokens = Scoreboard?.getLines()?.find((line) => line.getName().includes("Tokens"));
    if (tokens === undefined) return;

    tokens = tokens.getName().removeFormatting().replace(/\D/g,'');
    if (tokens >= Math.round(toggles.tokenAlert / 10) * 10) {
        Client.showTitle(`${BOLD + tokens} ${DARK_PURPLE + BOLD}TOKENS GATHERED!`, "", 0, 50, 5);
        alerted = true
    }
}).setFps(5), () => getWorld() === "Kuudra" && settings.kuudraAlerts && toggles.tokenAlert !== 0);
register("worldLoad", () => { alerted = false });
