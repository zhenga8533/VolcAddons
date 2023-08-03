import settings from "../../settings";
import { AQUA, BOLD, GOLD, OBFUSCATED, RESET } from "../../utils/constants";
import { getIsLeader } from "../../utils/party";
import { delay } from "../../utils/thread";
import { registerWhen } from "../../utils/variables";
import { getWorld } from "../../utils/worlds";


/**
 * Variables used to track party.
 */
let notInParty = 0;
let onCD = false;

/**
 * Warps other player into lobby once run begins.
 */
registerWhen(register("chat", () => {
    if (!getIsLeader() || onCD) return; 

    notInParty = 0;
    let timeout = 500;

    settings.kuudraRP.split(", ").forEach(ign => {
        if (notInParty < 2) {
            delay(() => ChatLib.command(`p ${ign}`), timeout);
            notInParty++;
            timeout += 500;
        }
    })
}).setCriteria("[NPC] Elle: Talk with me to begin!"), () => settings.kuudraRP);

/**
 * Tracks party transfers with a delay to prevent fast transfer bug.
 */
const TRANSFER = [
    "The party was transferred to ${player1} by ${player2}",
    "The party was transferred to ${player1} because ${player2} left",
    "${player1} has promoted ${player2} to Party Leader",
];
TRANSFER.forEach(msg => {
    registerWhen(register("chat", () => {
        onCD = true;
        delay(() => onCD = false, 6900);
    }).setCriteria(msg), () => settings.kuudraRP);
});

/**
 * Tracks when trader joins party to warp.
 */
registerWhen(register("chat", () => {
    if (!getIsLeader() || notInParty == 0) return;

    notInParty--;

    if (notInParty <= 0) {
        notInParty = 0;
        
        let players = [];
        settings.kuudraRP.split(", ").forEach((player) => { players.push(player) });

        delay(() => ChatLib.command("p warp"), 500);
        if (players.length == 3) delay(() => ChatLib.command(`p kick ${players[2]}`), 1000);
        delay(() => ChatLib.command(`p transfer ${players[0]}`), 1500);
        delay(() => ChatLib.command("p leave"), 2000);
    }
}).setCriteria("${player} joined the party."), () => settings.kuudraRP);

/**
 * Alerts player if they are leader as run ends.
 */
registerWhen(register("chat", () => {
    delay(() => {
        if (getIsLeader()) {
            ChatLib.chat(`\n${OBFUSCATED}1 2 3 4 5 6 5 4 3 2 1  ${RESET}${BOLD}${GOLD}<LEADER REMINDER>${RESET}${OBFUSCATED}  1 2 3 4 5 6 5 4 3 2 1\n`);
            Client.Companion.showTitle(`${GOLD}${BOLD}LEADER REMINDER!`, "", 10, 50, 10);
        } else {
            ChatLib.chat(`\n${OBFUSCATED}1 2 3 4 5 6 6 5 4 3 2 1  ${RESET}${BOLD}${AQUA}<BING CHILLING>${RESET}${OBFUSCATED}  1 2 3 4 5 6 6 5 4 3 2 1\n`);
            Client.Companion.showTitle(`${AQUA}${BOLD}BING CHILLING!`, "", 10, 50, 10);
        }
    }, 1000);
}).setCriteria("${before}Tokens Earned:${after}"), () => getWorld() === "Kuudra" && settings.kuudraRP);

/**
 * Resets party if player leaves instance.
 */
register("worldUnload", () => { notInParty = 0 });
