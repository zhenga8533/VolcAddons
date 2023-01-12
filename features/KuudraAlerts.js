import settings from "../settings"
import {COLORS} from "../constants"
import {FORMATS} from "../constants"
import {SOUNDS} from "../constants"

// NO KEY ALERT
register("chat", () => {
    if (settings.kuudraAlerts) {
        Client.Companion.showTitle(`${FORMATS.BOLD}NO KUUDRA KEY!`, "", 10, 50, 10)
    }
}).setCriteria("WARNING: You do not have a key for this tier in your inventory, you will not be able to claim rewards.");

// UNREADY ALERT
register("chat", (player) => {
    if (settings.kuudraAlerts) {
        const name = player.removeFormatting().toUpperCase();
        SOUNDS.MUSIC.play();
        Client.Companion.showTitle(`${FORMATS.BOLD}${FORMATS.ITALIC}${COLORS.DARK_RED}${name} ${FORMATS.RESET}IS NO LONGER READY!`, "", 10, 50, 10);
    }
}).setCriteria("${player} is no longer ready!");

// FUELING ALERT
register("chat", () => {
    if (settings.kuudraAlerts) {
        SOUNDS.MUSIC.play();
        Client.Companion.showTitle(`${FORMATS.BOLD}${COLORS.AQUA}FUEL SPAWNED!`, "", 10, 50, 10);
    }
}).setCriteria("[NPC] Elle: Not again!");

// BUILDING ALERT
register("chat", () => {
    if (settings.kuudraAlerts) {
        SOUNDS.MUSIC.play();
        Client.Companion.showTitle(`${FORMATS.BOLD}${COLORS.AQUA}START BUILDING!`, "", 10, 50, 10);
    }
}).setCriteria("[NPC] Elle: It's time to build the Ballista again! Cover me!");

// FIGHT ALERTS
register("chat", (player, percentage) => { // Ballista full alert
    if (settings.kuudraAlerts) {
        const bold = FORMATS.BOLD
        const aqua = COLORS.AQUA
        const gray = COLORS.GRAY
        const green = COLORS.GREEN
        const red = COLORS.RED

        SOUNDS.MUSIC.play();
        if (percentage.equals("100"))
            Client.Companion.showTitle(`${bold}${aqua}100% ${gray}[${green}||||${gray}]`, "", 10, 50, 10);
        else if (percentage.equals("75"))
            Client.Companion.showTitle(`${bold}${aqua}75% ${gray}[${green}|||${red}|${gray}]`, "", 10, 50, 10);
        else if (percentage.equals("50"))
            Client.Companion.showTitle(`${bold}${aqua}50% ${gray}[${green}||${red}||${gray}]`, "", 10, 50, 10);
        else if (percentage.equals("25"))
            Client.Companion.showTitle(`${bold}${aqua}25% ${gray}[${green}|${red}|||${gray}]`, "", 10, 50, 10);
    }
}).setCriteria("${player} recovered a Fuel Cell and charged the Ballista! (${percentage}%)");

register("chat", (player) => { // Stunner eaten alert
    const ign = player.toLowerCase();
    const stunner = settings.kuudraStunner.toLowerCase();
    if (settings.kuudraAlerts && !ign.equals("elle") && (settings.kuudraStunner.length == 0 || ign.equals(stunner))) {
        SOUNDS.MUSIC.play();
        Client.Companion.showTitle(`${FORMATS.BOLD}${COLORS.GREEN}STUNNER EATEN!`, "", 10, 50, 10);
    }
}).setCriteria("${player} has been eaten by Kuudra!");

register("chat", (player) => { // Ballista mounted alert
    const ign = player.toLowerCase();
    const cannonear = settings.kuudraCannonear.toLowerCase();
    if (settings.kuudraAlerts && (settings.kuudraCannonear.length == 0 || ign.equals(cannonear))) {
        SOUNDS.MUSIC.play();
        Client.Companion.showTitle(`${FORMATS.BOLD}${COLORS.AQUA}POSITION ASSUMED!`, "", 10, 50, 10);
    }
}).setCriteria("${player} mounted a Cannon!");

register("chat", (player) => { // Kuudra stunned alert
    if (settings.kuudraAlerts) {
        SOUNDS.MUSIC.play();
        Client.Companion.showTitle(`${FORMATS.BOLD}${COLORS.GREEN}KUUDRA STUNNED!`, "", 10, 50, 10);
    }
}).setCriteria("{player} destroyed one of Kuudra's pods!");