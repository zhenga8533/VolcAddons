import settings from "../settings"
import { getIsLeader } from "../utils/variables"
import { AQUA, BOLD, GOLD, OBFUSCATED, RESET } from "../utils/constants"

let notInParty = 0;
let onCD = false;

// TRACK KUUDRA START
register("chat", () => {
    if (settings.kuudraRP.length == 0 || !getIsLeader() || onCD) return; 

    notInParty = 0;
    let timeout = 500;

    settings.kuudraRP.split(", ").forEach(ign => {
        if (notInParty < 2) {
            setTimeout(() => { ChatLib.command(`p ${ign}`); }, timeout);
            notInParty++;
            timeout += 500;
        }
    })
}).setCriteria("[NPC] Elle: Talk with me to begin!");

// TRACKS TRANSFER (prevents bug when transfering too fast)
register("chat", () => {
    onCD = true;
    setTimeout(() => { onCD = false }, 6900);
}).setCriteria("The party was transferred to ${player1} by ${player2}");

register("chat", () => {
    onCD = true;
    setTimeout(() => { onCD = false }, 6900);
}).setCriteria("The party was transferred to ${player1} because ${player2} left");

register("chat", () => {
    onCD = true;
    setTimeout(() => { onCD = false }, 6900);
}).setCriteria("${player1} has promoted ${player2} to Party Leader")

// TRADER JOINS PARTY
register("chat", () => {
    if (!getIsLeader() || notInParty == 0) return;

    notInParty--;

    if (notInParty <= 0) {
        notInParty = 0;
        
        let players = [];
        settings.kuudraRP.split(", ").forEach((player) => { players.push(player) });

        setTimeout(() => {ChatLib.command("p warp")}, 500);
        if (players.length == 3) setTimeout(() => { ChatLib.command(`p kick ${players[2]}`)  }, 1000);
        setTimeout(() => { ChatLib.command(`p transfer ${players[0]}`) }, 1500);
        setTimeout(() => {ChatLib.command("p leave")}, 2000);
    }
}).setCriteria("${player} joined the party.");

// REMIND LEADER
register("chat", () => {
    setTimeout(function () {
        if (settings.kuudraRP.length == 0) return;

        ChatLib.chat('');
        if (getIsLeader()) {
            ChatLib.chat(`${OBFUSCATED}1 2 3 4 5 6 5 4 3 2 1  ${RESET}${BOLD}${GOLD}<LEADER REMINDER>${RESET}${OBFUSCATED}  1 2 3 4 5 6 5 4 3 2 1`);
            Client.Companion.showTitle(`${GOLD}${BOLD}LEADER REMINDER!`, "", 10, 50, 10);
        } else {
            ChatLib.chat(`${OBFUSCATED}1 2 3 4 5 6 6 5 4 3 2 1  ${RESET}${BOLD}${AQUA}<BING CHILLING>${RESET}${OBFUSCATED}  1 2 3 4 5 6 6 5 4 3 2 1`);
            Client.Companion.showTitle(`${AQUA}${BOLD}BING CHILLING!`, "", 10, 50, 10);
        }
        ChatLib.chat('');
    }, 1000);
}).setCriteria("${before}Tokens Earned:${after}");

// RESETS IN CASE YOU GO OUT OF RUN
register("worldUnload", () => {
    notInParty = 0;
});