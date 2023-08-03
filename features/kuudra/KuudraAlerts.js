import settings from "../../settings";
import {AQUA, BOLD, DARK_PURPLE, DARK_RED, GRAY, GREEN, MUSIC, RED, WHITE} from "../../utils/constants";
import { playSound } from "../../utils/functions";
import { registerWhen } from "../../utils/variables";
import { getWorld } from "../../utils/worlds";


/**
 * No key alert.
 */
registerWhen(register("chat", () => {
    Client.Companion.showTitle(`${BOLD}NO KUUDRA KEY!`, "", 10, 50, 10);
}).setCriteria("WARNING: You do not have a key for this tier in your inventory, you will not be able to claim rewards."),
() => getWorld() === "Kuudra" && settings.kuudraAlerts && settings.keyAlert);

/**
 * Unready alert.
 */
registerWhen(register("chat", (player) => {
    const name = player.removeFormatting().toUpperCase();
    playSound(MUSIC, 1000);
    Client.Companion.showTitle(`${DARK_RED}${BOLD}${name} ${WHITE}IS NO LONGER READY!`, "", 10, 50, 10);
}).setCriteria("${player} is no longer ready!"), () => getWorld() === "Kuudra" && settings.kuudraAlerts && settings.unreadyAlert);

/**
 * Choose perk alert.
 */
registerWhen(register("chat", () => {
    playSound(MUSIC, 1000);
    Client.Companion.showTitle(`${AQUA}${BOLD}BUY UPGRADE ROUTE!`, "", 10, 100, 10);
}).setCriteria("[NPC] Elle: Okay adventurers, I will go and fish up Kuudra!"),
() => getWorld() === "Kuudra" && settings.kuudraAlerts && settings.routeAlert);

/**
 * Supply spawned alert.
 */
registerWhen(register("chat", () => {
    playSound(MUSIC, 1000);
    Client.Companion.showTitle(`${AQUA}${BOLD}PICKUP SUPPLY!`, "", 10, 100, 10);
}).setCriteria("[NPC] Elle: Not again!"), () => getWorld() === "Kuudra" && settings.kuudraAlerts && settings.supplyAlert);

/**
 * Building started alert.
 */
registerWhen(register("chat", () => {
    playSound(MUSIC, 1000);
    Client.Companion.showTitle(`${AQUA}${BOLD}START BUILDING!`, "", 10, 50, 10);
}).setCriteria("[NPC] Elle: It's time to build the Ballista again! Cover me!"),
() => getWorld() === "Kuudra" && settings.kuudraAlerts && settings.buildingAlert);

/**
 * Fresh tools alert.
 */
registerWhen(register("chat", () => {
    playSound(MUSIC, 1000);
    Client.Companion.showTitle(`${GREEN}${BOLD}EAT FRESH!`, "", 10, 50, 10);
}).setCriteria("Your Fresh Tools Perk bonus doubles your building speed for the next 5 seconds!"),
() => getWorld() === "Kuudra" && settings.kuudraAlerts && settings.freshAlert);

/**
 * Fuel spawned alert.
 */
registerWhen(register("chat", (player, percentage) => { // Ballista full alert
    playSound(MUSIC, 1000);
    switch (percentage) {
        case "100":
            Client.Companion.showTitle(`${AQUA}${BOLD}100% ${GRAY}[${GREEN}||||${GRAY}]`, "", 10, 100, 10);
            break;
        case "75":
            Client.Companion.showTitle(`${AQUA}${BOLD}75% ${GRAY}[${GREEN}|||${RED}|${GRAY}]`, "", 10, 50, 10);
            break;
        case "50":
            Client.Companion.showTitle(`${AQUA}${BOLD}50% ${GRAY}[${GREEN}||${RED}||${GRAY}]`, "", 10, 50, 10);
            break;
        case "25":
            Client.Companion.showTitle(`${AQUA}${BOLD}25% ${GRAY}[${GREEN}|${RED}|||${GRAY}]`, "", 10, 50, 10);
            break;
    }
}).setCriteria("${player} recovered a Fuel Cell and charged the Ballista! (${percentage}%)"),
() => getWorld() === "Kuudra" && settings.kuudraAlerts && settings.fuelAlert);

/**
 * Stunner eaten alert.
 */
registerWhen(register("chat", (player) => {
    const ign = player.toUpperCase();
    const stunner = settings.kuudraStunner.toUpperCase();

    if (!ign.equals("ELLE") && (stunner.length == 0 || ign.equals(stunner))) {
        playSound(MUSIC, 1000);
        Client.Companion.showTitle(`${GREEN}${BOLD}${ign} WAS EATEN!`, "", 10, 100, 10);
    }
}).setCriteria("${player} has been eaten by Kuudra!"), () => getWorld() === "Kuudra" && settings.kuudraAlerts && settings.fuelAlert);

/**
 * Ballista mounted alert.
 */
registerWhen(register("chat", (player) => {
    const ign = player.toUpperCase();
    const cannonear = settings.kuudraCannonear.toUpperCase();

    if (settings.kuudraCannonear.length == 0 || ign.equals(cannonear)) {
        playSound(MUSIC, 1000);
        Client.Companion.showTitle(`${AQUA}${BOLD}${ign} ASSUMED THE POSITION!`, "", 10, 100, 10);
    }
}).setCriteria("${player} mounted a Cannon!"), () => getWorld() === "Kuudra" && settings.kuudraAlerts && settings.ballistaAlert);

/**
 * Kuudra stunned alert.
 */
registerWhen(register("chat", () => {
    playSound(MUSIC, 1000);
    Client.Companion.showTitle(`${GREEN}${BOLD}KUUDRA STUNNED!`, "", 10, 100, 10);
}).setCriteria("{player} destroyed one of Kuudra's pods!"), () => getWorld() === "Kuudra" && settings.kuudraAlerts && settings.stunAlert);

/**
 * Warns player about dropship as they get close to center.
 */
const EntityGhast = Java.type('net.minecraft.entity.monster.EntityGhast');
let alerted = false
registerWhen(register("step", () => {
    if (settings.kuudraAlerts && settings.dropshipAlert) {
        let ghasts = World.getAllEntitiesOfType(EntityGhast.class);
        const dropships = ghasts.filter((ghast) => {
            distance = Math.hypot(ghast.getX() + 101, ghast.getZ() + 105);
            return distance < 20 && distance > 10;
        })

        if (dropships.length)
            Client.Companion.showTitle(`${RED}${BOLD}ART IS AN EXPLOSION!`, "", 0, 50, 5);
    }
}).setFps(1), () => getWorld() === "Kuudra" && settings.kuudraAlerts && settings.dropshipAlert);

/**
 * Alerts player when token gathered surpasses set threshhold.
 */
registerWhen(register("step", () => {
    if (settings.kuudraAlerts && settings.tokenAlert && !alerted) {
        tokens = Scoreboard.getLines().find((line) => line.getName().includes("Tokens"));
        if (tokens) {
            tokens = tokens.getName().removeFormatting().replace(/\D/g,'');
            if (tokens >= Math.round(settings.tokenAlert / 10) * 10) {
                Client.Companion.showTitle(`${BOLD}${tokens} ${DARK_PURPLE}${BOLD}TOKENS GATHERED!`, "", 0, 50, 5);
                alerted = true
            }
        }
    }
}).setFps(5), () => getWorld() === "Kuudra" && settings.kuudraAlerts && settings.tokenAlert);
register("worldLoad", () => { alerted = false });
