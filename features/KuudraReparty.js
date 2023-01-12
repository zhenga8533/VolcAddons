import settings from "../settings"
import {data} from "../variables"

// TRACK KUUDRA START
register("chat", () => {
    if (!settings.kuudraRP.equals("")) {
        if (data.kuudraRP.needToReparty) {
            setTimeout(function () {ChatLib.command(`p ${settings.kuudraRP}`)}, 500);
            data.kuudraRP.waitingOnJoin = true;
            data.kuudraRP.needToReparty = false;
            data.save()
        }
    }
}).setCriteria("[NPC] Elle: Talk with me to begin!");

// TRADER JOINS PARTY
register("chat", () => {
    if (data.kuudraRP.waitingOnJoin) {
        data.kuudraRP.waitingOnJoin = false;
        data.save();

        setTimeout(function () {ChatLib.command("p warp")}, 500);
        setTimeout(function () {ChatLib.command(`p transfer ${settings.kuudraRP}`)}, 3500);
        setTimeout(function () {ChatLib.command("p leave")}, 4000);
    }
}).setCriteria("${rank} ${player} joined the party.");

// PARTY TRANSFERED OVER
register("chat", (rank1, name1, rank2, name2) => {
    if (Player.getName().equals(name1)) {
        data.kuudraRP.needToReparty = true;
        data.save();
    }
}).setCriteria("The party was transferred to ${rank1} ${name1} by ${rank2} ${name2}")

register("chat", (rank1, name1, rank2, name2) => {
    if (Player.getName().equals(name1)) {
        data.kuudraRP.needToReparty = true;
        data.save();
    }
}).setCriteria("The party was transferred to ${rank1} ${name1} because ${rank2} ${name2} left")

// REMIND LEADER
register("chat", () => {
    if (data.kuudraRP.needToReparty) {
        Client.Companion.showTitle(`${FORMATS.BOLD}${COLORS.AQUA}REMEMBER TO JOIN INSTANCE!`, "", 10, 50, 10);
    }
}).setCriteria("&r&6&lKUUDRA DOWN!&r")