import axios from "../../axios";
import settings from "../settings"
import { getIsLeader, getPlayerName } from "../variables"
import { request } from "../../requestV2";
import { AQUA, DARK_AQUA, DARK_GREEN, WHITE } from "../constants";

// Variables for different commands
let onCD = false;

// Imgur upload
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

// Waifu stuff >.<
let waifu = "";
let imgur = "";
function setWaifu() {
    axios.get("https://api.waifu.im/search").then((link) => {
        waifu = link.data.images[0].url;
    })

    setTimeout(() => {
        upload(waifu).then(({ data: { link } }) => {
            imgur = link;
        })
    }, 1000);
}
setWaifu();

// Response Variables
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

export function executeCommand(name, args, toParty) {
    if (settings.partyCommands) { // PARTY COMMANDS
        switch (args[0]) {
            case "cringe": // Cringe gay
            case "gay":
            case "racist":
                const percentage = Math.floor(Math.random() * 100) + 1;
                if (toParty)
                    setTimeout(() => { ChatLib.command(`pc ${name} is ${percentage}% ${args[0]}!`) }, 500);
                else
                    ChatLib.chat(`${DARK_AQUA}You are ${WHITE}${percentage}% ${DARK_AQUA}${args[0]}!`);
                break;
            case "dice": // Dice roll
            case "roll":
                const roll = Math.floor(Math.random() * 6) + 1;
                if (toParty)
                    setTimeout(() => { ChatLib.command(`pc ${name} rolled a ${roll}!`) }, 500);
                else
                    ChatLib.chat(`${DARK_AQUA}You rolled a ${WHITE}${roll}${DARK_AQUA}!`);
                break;
            case "coin": // Coin flip
            case "flip":
            case "coinflip":
            case "cf":
                const flip = Math.floor(Math.random() * 2);
                if (toParty) {
                    if (flip)
                        setTimeout(() => { ChatLib.command(`pc ${name} flipped heads!`) }, 500);
                    else
                        setTimeout(() => { ChatLib.command(`pc ${name} flipped tails!`) }, 500);
                } else {
                    if (flip)
                        ChatLib.chat(`${DARK_AQUA}You flipped ${WHITE}heads${DARK_AQUA}!`);
                    else
                        ChatLib.chat(`${DARK_AQUA}You flipped ${WHITE}tails${DARK_AQUA}!`);
                }
                break;
            case "8ball": // 8ball
                if (toParty)
                    setTimeout(() => { ChatLib.command(`pc ${RESPONSES[Math.floor(Math.random() * 20) + 1]}.`) }, 500);
                else
                    ChatLib.chat(`${DARK_AQUA}${RESPONSES[Math.floor(Math.random() * 20) + 1]}.`)
                break;
            case "rps": // Rock Paper Siccors
                const player = args[1] == undefined ? -1 : RPS.indexOf(args[1].toLowerCase());
                let reply = player == -1 ? `Wtf is a(n) ${args[1]}? Are you from the jungle?` : "zzz...";
                // Plays game out if user inputs a correct symbol
                if (player != -1) {
                    const choice = Math.floor(Math.random() * 3);
                    if (toParty)
                        setTimeout(() => { ChatLib.command(`pc I choose ${RPS[choice]}!`) }, 500);
                    else
                        ChatLib.chat(`${DARK_AQUA}I choose ${WHITE}${RPS[choice]}${DARK_AQUA}!`);
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
                if (toParty)
                    setTimeout(() => { ChatLib.command(`pc ${reply}`) }, 1000);
                else
                    setTimeout(() => { ChatLib.chat(`${DARK_AQUA}${reply}`) }, 500);
                break;
            case "waifu":
            case "w":
                ChatLib.chat(`${DARK_GREEN}Uploading ${waifu} ${DARK_GREEN}to Imgur!`);
                if (toParty)
                    setTimeout(() => { ChatLib.command(`pc ${imgur}`) }, 500);
                else
                    ChatLib.command(`msg ${Player.getName()} ${imgur} ${(Math.random() + 1).toString(36).substring(8)}`);
                // Randomize end to avoid duplicate message ^
                setWaifu();
                break;
            case "help":
                if (toParty) {
                    setTimeout(() => { ChatLib.command(`pc Party Commands: ?<cringe, gay, racist, dice, coin, 8ball, rps, w, help>`) }, 300);
                    if (getIsLeader() && settings.leaderCommands)
                        setTimeout(() => { ChatLib.command(`pc Leader Commands: ?<warp, transfer, promote, demote, allinv, stream #>`) }, 700);
                }
                break;
        }
    }
    
    if (getIsLeader() && settings.leaderCommands) { // LEADER COMMANDS
        setTimeout(() => {
            switch (args[0]) {
                case "warp":
                    ChatLib.command("p warp");
                    break;
                case "transfer":
                    ChatLib.command("p transfer " + name);
                    break;
                case "promote":
                    ChatLib.command("p promote " + name);
                    break;
                case "demote":
                    ChatLib.command("p demote " + name);
                    break;
                case "allinvite":
                case "allinv":
                    ChatLib.command("p settings allinvite");
                    break;
                case "streamopen":
                case "stream":
                    num = isNaN(args[1]) ? 10 : args[1];
                    ChatLib.command(`stream open ${args[1]}`);
                    break;
            }
        }, 250);
    }

    onCD = true;
    setTimeout(() => { onCD = false }, 1000);
}

// PARTY COMMANDS
register("chat", (player, message) => {
    if (onCD) return;

    executeCommand(getPlayerName(player), message.split(" "), true);
}).setCriteria("Party > ${player}: ?${message}");