import settings from "../settings"
import {data} from "../variables"
import {SOUNDS} from "../constants"

// PARTY COMMANDS
register("chat", (rank, player, message) => {
    if (settings.partyCommands) {
        setTimeout(function () {
            if (message.equals("cringe")) { // FUN COMMANDS
                const cringe = Math.floor(Math.random() * 100) + 1;
                ChatLib.command(`pc ${player} is ${cringe}% cringe!`);
            } else if (message.equals("gay")) {
                const cringe = Math.floor(Math.random() * 100) + 1;
                ChatLib.command(`pc ${player} is ${cringe}% gay!`);
            } else if (message.equals("dice") || message.equals("d6") || message.equals("roll")) {
                const roll = Math.floor(Math.random() * 6) + 1;
                ChatLib.command(`pc ${player} rolled a ${roll}!`);
            } else if (message.equals("coin") || message.equals("flip")) {
                const flip = Math.floor(Math.random() * 2);
                if (flip) ChatLib.command(`pc ${player} flipped heads!`);
                else ChatLib.command(`pc ${player} flipped tails!`);
            }
            
            if (data.isLeader) { // LEADER COMMANDS
                if (message.equals("warp")) {
                    ChatLib.command("p warp");
                } else if (message.equals("transfer")) {
                    ChatLib.command("p transfer " + player);
                } else if (message.equals("promote")) {
                    ChatLib.command("p promote " + player);
                } else if (message.equals("demote")) {
                    ChatLib.command("p demote " + player);
                } else if (message.equals("allinvite") || message.equals("allinv")) {
                    ChatLib.command("p settings allinvite");
                }
            }
        }, 500);
    }
}).setCriteria("Party > ${rank} ${player}: ?${message}");