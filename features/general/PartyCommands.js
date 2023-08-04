import settings from "../../settings";
import { AQUA, DARK_AQUA, DARK_GREEN, LOGO, WHITE } from "../../utils/constants";
import { getGuildName, getPlayerName } from "../../utils/functions";
import { getIsLeader } from "../../utils/party";
import { delay } from "../../utils/thread";
import { data, registerWhen } from "../../utils/variables";

import axios from "../../../axios";
import { request } from "../../../requestV2";


/**
 * Variable used to represent /pc cooldown and possible responses.
 */
let onCD = false;
const RESPONSES = ["As I see it, yes",
                    "It is certain",
                    "It is decidedly so",
                    "Most likely",
                    "Outlook good",
                    "Signs point to yes",
                    "Without a doubt",
                    "Yes",
                    "Yes - definitely",
                    "You may rely on it",
                    "Reply hazy, try again",
                    "Ask again later",
                    "Better not tell you now",
                    "Cannot predict now",
                    "Concentrate and ask again",
                    "Don't count on it",
                    "My reply is no",
                    "My sources say no",
                    "Outlook not so good",
                    "Very doubtful"];
const RPS = ["rock", "paper", "scissors"];
const QUOTES = JSON.parse(FileLib.read("./VolcAddons/assets", "quotes.json"));

/**
 * Makes a POST request to upload an image to Imgur.
 *
 * @param {string} image - Link of the image.
 */
function upload(image) {
    return request({
        url: "https://api.imgur.com/3/image",
        method: "POST",
        headers: {
            Authorization: `Client-ID d30c6dc9941b52b`,
        },
        body: {
            image
        },
        json: true
    });
};

/**
 * Makes a PULL request to get a random waifu image >.<
 */
let waifu = "";
let imgur = "";
function setWaifu() {
    axios.get("https://api.waifu.im/search").then((link) => {
        waifu = link.data.images[0].url;
    })

    delay(() => {
        upload(waifu).then(({ data: { link } }) => {
            imgur = link;
        })
    }, 1000);
}
setWaifu();

/**
 * Various party and leader commands.
 *
 * @param {string} name - IGN of player who sent the message.
 * @param {string[]} args - Message player sent split by " ".
 * @param {string} sendTo - Chat to send response to (/pc, /gc, /r)
 */
export function executeCommand(name, args, sendTo) {
    if (data.blacklist.includes(name.toLowerCase())) return;

    if (settings.partyCommands) { // PARTY COMMANDS
        const randID = '@' + (Math.random() + 1).toString(36).substring(5);

        delay(() => { switch (args[0]) {
            case "cringe": // Cringe gay
            case "gay":
            case "racist":
                if (!settings.slanderCommand) return;

                const percentage = Math.floor(Math.random() * 100) + 1;
                if (sendTo) ChatLib.command(`${sendTo} ${name} is ${percentage}% ${args[0]}! ${randID}`);
                else ChatLib.chat(`${LOGO} ${DARK_AQUA}You are ${WHITE}${percentage}% ${DARK_AQUA}${args[0]}!`);
                break;
            case "dice": // Dice roll
            case "roll":
                if (!settings.diceCommand) return;

                const roll = Math.floor(Math.random() * 6) + 1;
                if (sendTo) ChatLib.command(`${sendTo} ${name} rolled a ${roll}! ${randID}`);
                else ChatLib.chat(`${LOGO} ${DARK_AQUA}You rolled a ${WHITE}${roll}${DARK_AQUA}!`);
                break;
            case "coin": // Coin flip
            case "flip":
            case "coinflip":
            case "cf":
                if (!settings.coinCommand) return;

                const flip = Math.floor(Math.random() * 2) ? "heads" : "tails";
                if (sendTo) ChatLib.command(`${sendTo} ${name} flipped ${flip}! ${randID}`);
                else ChatLib.chat(`${LOGO} ${DARK_AQUA}You flipped ${WHITE}${flip}${DARK_AQUA}!`);
                break;
            case "8ball": // 8ball
                if (!settings.ballCommand) return;

                if (sendTo) ChatLib.command(`${sendTo} ${RESPONSES[Math.floor(Math.random() * 20) + 1]}. ${randID}`);
                else ChatLib.chat(`${LOGO} ${DARK_AQUA}${RESPONSES[Math.floor(Math.random() * 20) + 1]}.`)
                break;
            case "rps": // Rock Paper Siccors
                if (!settings.rpsCommand) return;

                const player = args[1] === undefined ? -1 : RPS.indexOf(args[1].toLowerCase());
                let reply = player == -1 ? `Wtf is a(n) ${args[1]}? Are you from the jungle?` : "zzz...";
                // Plays game out if user inputs a correct symbol
                if (player != -1) {
                    const choice = Math.floor(Math.random() * 3);
                    if (sendTo) ChatLib.command(`${sendTo} I choose ${RPS[choice]}! ${randID}`);
                    else ChatLib.chat(`${LOGO} ${DARK_AQUA}I choose ${WHITE}${RPS[choice]}${DARK_AQUA}!`);
                    const outcome = (player - choice);

                    // Determine outcome of the game
                    switch (outcome) {
                        case -2:
                        case 1:
                            reply = "bor, this game is so bad.";
                            break;
                        case 2:
                        case -1:
                            const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
                            reply = `I believe you may need some advice: ${WHITE}"${quote}" ${AQUA}~Volcaronitee (i think)`;
                            break;
                    }
                }
                
                // Output reponse depending if use wants party message or user message
                if (sendTo) delay(() => ChatLib.command(`${sendTo} ${reply} ${randID}`), 690);
                else ChatLib.chat(`${LOGO} ${DARK_AQUA}${reply}`);
                break;
            case "waifu":
            case "women":
            case "w":
                if (!settings.womenCommand) return;

                ChatLib.chat(`${LOGO} ${DARK_GREEN}Uploading ${waifu} ${DARK_GREEN}to Imgur!`);
                if (sendTo) ChatLib.command(`${sendTo} ${imgur} ${randID}`);
                else ChatLib.command(`msg ${Player.getName()} ${imgur} @${(Math.random() + 1).toString(36).substring(6)}`);
                // Randomize end to avoid duplicate message ^
                setWaifu();
                break;
            case "coords":
                if (!settings.coordsCommand) return;

                if (sendTo) ChatLib.command(`${sendTo} x: ${Math.round(Player.getX())}, y: ${Math.round(Player.getY())}, z: ${Math.round(Player.getZ())} ${randID}`);
                else ChatLib.chat(`x: ${Math.round(Player.getX())}, y: ${Math.round(Player.getY())}, z: ${Math.round(Player.getZ())}`);
                break;
            case "invite":
            case "inv":
                if (!settings.inviteCommand || sendTo != "r") return;

                if (data.whitelist.includes(name.toLowerCase())) ChatLib.command(`p ${name}`);
                else ChatLib.command(`r You are not in the whitelist! ${randID}`);
                break;
            case "limbo":
            case "lobby":
            case "l":
                if (!settings.limboCommand || getIsLeader()) return;

                ChatLib.command("l");
                break;
            case "leave":
                if (!settings.limboCommand || getIsLeader()) return;

                ChatLib.command("p leave");
                break;
            case "help":
                if (!settings.helpCommand || !sendTo) return;

                ChatLib.command(`${sendTo} Party Commands: ?<cringe, gay, racist, dice, coin, 8ball, rps, w, lobby, leave, help> ${randID}`);
                if (getIsLeader() && settings.leaderCommands)
                    delay(() => ChatLib.command(`${sendTo} Leader Commands: ?<warp, transfer, promote, demote, allinv, stream #> ${randID}`), 690);
                break;
        } }, 690);
    }
    
    if (getIsLeader() && settings.leaderCommands) { // LEADER COMMANDS
        if (sendTo != "pc") return;
        
        delay(() => {
            switch (args[0]) {
                case "warp":
                    if (!settings.warpCommand) return;
    
                    ChatLib.command("p warp");
                    break;
                case "transfer":
                    if (!settings.transferCommand) return;
    
                    ChatLib.command("p transfer " + name);
                    break;
                case "promote":
                    if (!settings.promoteCommand) return;
    
                    ChatLib.command("p promote " + name);
                    break;
                case "demote":
                    if (!settings.demoteCommand) return;
    
                    ChatLib.command("p demote " + name);
                    break;
                case "allinvite":
                case "allinv":
                    if (!settings.allinvCommand) return;
    
                    ChatLib.command("p settings allinvite");
                    break;
                case "streamopen":
                case "stream":
                    if (!settings.streamCommand) return;
    
                    num = isNaN(args[1]) ? 10 : args[1];
                    ChatLib.command(`stream open ${args[1]}`);
                    break;
            }
        }, 250);
    }

    onCD = true;
    delay(() => onCD = false, 1000);
}

/**
 * Detects when player inputs a ?command and set the chat 
 *
 * @param {string} player - "[rank] ign".
 * @param {string} message - Message sent by player following a "?"
 */
registerWhen(register("chat", (player, message) => {
    if (onCD) return;
    executeCommand(getPlayerName(player), message.split(" "), "pc");
}).setCriteria("Party > ${player}: ?${message}"), () => settings.partyCommands == 1 || settings.partyCommands == 2);
registerWhen(register("chat", (player, message) => {
    if (onCD) return;
    executeCommand(getGuildName(player), message.split(" "), "gc");
}).setCriteria("Guild > ${player}: ?${message}"), () => settings.partyCommands == 1 || settings.partyCommands == 3);
registerWhen(register("chat", (player, message) => {
    if (onCD) return;
    executeCommand(getPlayerName(player), message.split(" "), "r");
}).setCriteria("From ${player}: ?${message}"), () => settings.partyCommands == 1 || settings.partyCommands == 4);
