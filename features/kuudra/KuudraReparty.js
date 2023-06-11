import settings from "../../settings"
import { getIsLeader, getWorld, registerWhen } from "../../utils/variables"
import { AQUA, BOLD, GOLD, OBFUSCATED, RESET } from "../../utils/constants"

let notInParty = 0;
let onCD = false;

// TRACK KUUDRA START
registerWhen(register("chat", () => {
    if (!getIsLeader() || onCD) return; 

    notInParty = 0;
    let timeout = 500;

    settings.kuudraRP.split(", ").forEach(ign => {
        if (notInParty < 2) {
            setTimeout(() => { ChatLib.command(`p ${ign}`); }, timeout);
            notInParty++;
            timeout += 500;
        }
    })
}).setCriteria("[NPC] Elle: Talk with me to begin!"), () => settings.kuudraRP);

// TRACKS TRANSFER (prevents bug when transfering too fast)
registerWhen(register("chat", () => {
    onCD = true;
    setTimeout(() => { onCD = false }, 6900);
}).setCriteria("The party was transferred to ${player1} by ${player2}"), () => settings.kuudraRP);

registerWhen(register("chat", () => {
    onCD = true;
    setTimeout(() => { onCD = false }, 6900);
}).setCriteria("The party was transferred to ${player1} because ${player2} left"), () => settings.kuudraRP);

registerWhen(register("chat", () => {
    onCD = true;
    setTimeout(() => { onCD = false }, 6900);
}).setCriteria("${player1} has promoted ${player2} to Party Leader"), () => settings.kuudraRP);

// TRADER JOINS PARTY
registerWhen(register("chat", () => {
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
}).setCriteria("${player} joined the party."), () => settings.kuudraRP);

// REMIND LEADER
registerWhen(register("chat", () => {
    setTimeout(function () {
        if (getIsLeader()) {
            ChatLib.chat(`\n${OBFUSCATED}1 2 3 4 5 6 5 4 3 2 1  ${RESET}${BOLD}${GOLD}<LEADER REMINDER>${RESET}${OBFUSCATED}  1 2 3 4 5 6 5 4 3 2 1\n`);
            Client.Companion.showTitle(`${GOLD}${BOLD}LEADER REMINDER!`, "", 10, 50, 10);
        } else {
            ChatLib.chat(`\n${OBFUSCATED}1 2 3 4 5 6 6 5 4 3 2 1  ${RESET}${BOLD}${AQUA}<BING CHILLING>${RESET}${OBFUSCATED}  1 2 3 4 5 6 6 5 4 3 2 1\n`);
            Client.Companion.showTitle(`${AQUA}${BOLD}BING CHILLING!`, "", 10, 50, 10);
        }
    }, 1000);
}).setCriteria("${before}Tokens Earned:${after}"), () => getWorld() == "kuudra" && settings.kuudraRP);

// RESETS IN CASE YOU GO OUT OF RUN
register("worldUnload", () => {
    notInParty = 0;
});
