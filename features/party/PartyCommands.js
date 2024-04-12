import axios from "../../../axios";
import { request } from "../../../requestV2";
import settings from "../../utils/settings";
import toggles from "../../utils/toggles";
import { AQUA, DARK_AQUA, DARK_GRAY, DARK_GREEN, GREEN, LOGO, RED, WHITE } from "../../utils/constants";
import { randIndex } from "../../utils/functions/misc";
import { getIsLeader } from "../../utils/party";
import { getGuildName, getPlayerName } from "../../utils/functions/player";
import { delay } from "../../utils/thread";
import { data, registerWhen } from "../../utils/variables";
import { getPing, getTPS } from "../general/Performance";


/**
 * Variable used to represent /pc cooldown and possible responses.
 */
let onCD = false;
const RESPONSES = JSON.parse(FileLib.read("./VolcAddons/assets", "8ball.json"));
const RPS = ["rock", "paper", "scissors"];
const QUOTES = JSON.parse(FileLib.read("./VolcAddons/assets", "quotes.json"));
const W = ["waifu", "neko", "shinobu", "megumin", "bully", "cuddle", "cry", "hug", "awoo", "kiss", "lick", "pat", "smug", "bonk", "yeet", "blush", "smile", "wave", "highfive", 
    "handhold", "nom", "bite", "glomp", "slap", "kill", "kick", "happy", "wink", "poke", "dance", "cringe"];
const IMGUR_KEYS = [
    "d30c6dc9941b52b",
    "b2e8519cbb7712a",
    "eb1f61e23b9eabd",
    "d1275dca5af8904",
    "ed46361ccd67d6d"
];

/**
 * Makes a POST request to upload an image to Imgur.
 *
 * @param {String} image - Link of the image.
 */
function upload(image) {
    const clientID = IMGUR_KEYS[parseInt(Math.random() * (IMGUR_KEYS.length - 1))];

    return request({
        url: "https://api.imgur.com/3/image",
        method: "POST",
        headers: {
            Authorization: `Client-ID ${clientID}`,
        },
        body: {
            image
        },
        json: true
    });
};

let waifu = "";
let imgur = "";
/**
 * Makes a PULL request to get a random waifu image >.<
 * 
 * @param {*} announce 
 * @param {*} category 
 */
function setWaifu(announce, category=toggles.womenCommand) {
    if (category === 1) category = W[Math.floor(Math.random() * (W.length - 1))];
    else category = W[category - 2];
    axios.get(`https://api.waifu.pics/sfw/${category}`).then(link => {
        waifu = link.data.url;
        if (announce)
            new Message(`\n${LOGO + DARK_GREEN}Uploading `,
                new TextComponent(waifu).setHoverValue(waifu),
                ` ${DARK_GREEN}to Imgur!`).setChatLineId(11997).chat();
        upload(waifu).then(({ data: { link } }) => {
            ChatLib.clearChat(11997);

            // Success
            imgur = link;
            if (announce)
                new Message(`\n${LOGO + GREEN}Uploaded `,
                    new TextComponent(imgur).setHoverValue(imgur),
                    ` ${GREEN}to Imgur successfully! `,
                    new TextComponent(`${DARK_GRAY}[click to regenerate]`).setClick("run_command", "/va w").setHoverValue("Click me!")).chat();
        }).catch(err => {
            const error = err.data.error;
            if (announce) {
                // Attempt to use base Imgur API
                ChatLib.chat(`${LOGO + RED}Imgur Upload Failed: ${error?.message ?? error}`);
                ChatLib.chat(`${LOGO + DARK_GRAY}Attempting to fetch using Imgur API...`);
            }
            
            const clientID = IMGUR_KEYS[parseInt(Math.random() * (IMGUR_KEYS.length - 1))];
            request({
                url: "https://api.imgur.com/3/gallery/t/waifu/viral/1?showViral=true",
                method: "GET",
                headers: {
                    Authorization: `Client-ID ${clientID}`,
                },
                json: true
            }).then(res => {
                const items = res.data.items;
                const images = items[randIndex(items)]?.images;
                const id = images[randIndex(images)]?.id;

                imgur = `https://i.imgur.com/${id}.png`;
            }).catch(_ => ChatLib.chat(`${LOGO + DARK_RED}Imgur fetch failed...`));
        });
    });
}
export function getWaifu() { return imgur };
setWaifu(false);

/**
 * Various party and leader commands.
 *
 * @param {String} name - IGN of player who sent the message.
 * @param {String[]} args - Message player sent split by " ".
 * @param {String} sendTo - Chat to send response to (/pc, /gc, /r)
 */
export function executeCommand(name, args, sendTo) {
    if (data.ignorelist.includes(name.toLowerCase())) return;
    const command = args[0].toLowerCase();

    // PARTY COMMANDS
    const randID = sendTo === "pc" ? '' : '@' + (Math.random() + 1).toString(36).substring(2);

    delay(() => { switch (command) {
        case "cringe": // Slander
        case "gay":
        case "racist":
        case "femboy":
        case "trans":
        case "transphobic":
            if (!toggles.slanderCommand) return;

            const slandering = args[1] ?? name;
            const percentage = Math.floor(Math.random() * 100) + 1;
            if (sendTo !== false) ChatLib.command(`${sendTo} ${slandering} is ${percentage}% ${command}! ${randID}`);
            else ChatLib.chat(`${LOGO + DARK_AQUA}You are ${WHITE + percentage}% ${DARK_AQUA + command}!`);
            break;
        case "dice": // Dice roll
        case "roll":
            if (!toggles.diceCommand) return;

            const roll = Math.floor(Math.random() * 6) + 1;
            if (sendTo !== false) ChatLib.command(`${sendTo} ${name} rolled a ${roll}! ${randID}`);
            else ChatLib.chat(`${LOGO + DARK_AQUA}You rolled a ${WHITE + roll + DARK_AQUA}!`);
            break;
        case "coin": // Coin flip
        case "flip":
        case "coinflip":
        case "cf":
            if (!toggles.coinCommand) return;

            const flip = Math.floor(Math.random() * 2) ? "heads" : "tails";
            if (sendTo !== false) ChatLib.command(`${sendTo} ${name} flipped ${flip}! ${randID}`);
            else ChatLib.chat(`${LOGO + DARK_AQUA}You flipped ${WHITE + flip + DARK_AQUA}!`);
            break;
        case "8ball": // 8ball
            if (!toggles.ballCommand) return;

            if (sendTo !== false) ChatLib.command(`${sendTo} ${RESPONSES[Math.floor(Math.random() * 20) + 1]}. ${randID}`);
            else ChatLib.chat(`${LOGO + DARK_AQUA + RESPONSES[Math.floor(Math.random() * 20) + 1]}.`)
            break;
        case "rps": // Rock Paper Siccors
            if (!toggles.rpsCommand) return;

            const player = args[1] === undefined ? -1 : RPS.indexOf(args[1].toLowerCase());
            let reply = player === -1 ? `なんと、 ${args[1]}?` : "zzz...";
            // Plays game out if user inputs a correct symbol
            if (player !== -1) {
                const choice = Math.floor(Math.random() * 3);
                if (sendTo !== false) ChatLib.command(`${sendTo} I choose ${RPS[choice]}! ${randID}`);
                else ChatLib.chat(`${LOGO + DARK_AQUA}I choose ${WHITE + RPS[choice] + DARK_AQUA}!`);
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
            if (sendTo !== false) delay(() => ChatLib.command(`${sendTo} ${reply} ${randID}`), 690);
            else ChatLib.chat(`${LOGO + DARK_AQUA + reply}`);
            break;
        case "waifu":
        case "women":
        case "w":
            if (toggles.womenCommand === 0) return;

            if (sendTo !== false) ChatLib.command(`${sendTo} ${imgur} ${randID}-vaw`);
            // Randomize end to avoid duplicate message ^
            setWaifu(true);
            break;
        case "coords":
        case "waypoint":
        case "xyz":
            if (!toggles.coordsCommand || Player.getName() === name) return;

            if (sendTo !== false) ChatLib.command(`${sendTo} x: ${Math.round(Player.getX())}, y: ${Math.round(Player.getY())}, z: ${Math.round(Player.getZ())} ${randID}`);
            else ChatLib.command(`r x: ${Math.round(Player.getX())}, y: ${Math.round(Player.getY())}, z: ${Math.round(Player.getZ())}`);
            break;
        case "fps":
            if (!toggles.statusCommand) return;

            if (sendTo !== false) ChatLib.command(`${sendTo} ${Client.getFPS()}fps`);
            break;
        case "ping":
            if (!toggles.statusCommand) return;

            if (sendTo !== false) ChatLib.command(`${sendTo} ${getPing()}ms`);
            break;
        case "tps":
            if (!toggles.statusCommand) return;

            if (sendTo !== false) ChatLib.command(`${sendTo} ${getTPS().toFixed(2)}tps`);
            break;
        case "limbo":
        case "lobby":
        case "l":
            if (!toggles.limboCommand || getIsLeader() || Player.getName() === name) return;

            ChatLib.command("l");
            break;
        case "leave":
            if (!toggles.limboCommand || getIsLeader() || Player.getName() === name) return;

            ChatLib.command("p leave");
            break;
        case "help":
            if (!toggles.helpCommand || !sendTo) return;

            ChatLib.command(`${sendTo} Party Commands: ?<dice, coin, 8ball, rps, w, lobby, leave, xyz, help> ${randID}`);
            if (getIsLeader() && settings.leaderCommands)
                delay(() => ChatLib.command(`${sendTo} Leader Commands: ?<warp, transfer, promote, demote, allinv, stream> ${randID}`), 690);
            break;
        default:
            // Check for unique ?w commands
            const wIndex = W.indexOf(command)
            if (toggles.womenCommand === 0 || wIndex === -1) return;

            if (sendTo !== false) ChatLib.command(`${sendTo} ${imgur} ${randID}-vaw`);
            // Randomize end to avoid duplicate message ^
            setWaifu(true, wIndex + 2);
            break;
    } }, 690);
    
    // LEADER COMMANDS
    if (!sendTo || (sendTo === "pc" && getIsLeader() && settings.leaderCommands && Player.getName() !== name)) {
        switch (command) {
            case "mute":
                if (!toggles.warpCommand) return;
                ChatLib.command("p mute");
                break;
            case "warp":
                if (!toggles.warpCommand) return;
                ChatLib.command("p warp");
                break;
            case "transfer":
            case "ptme":
            case "pt":
                if (!toggles.transferCommand) return;
                ChatLib.command("p transfer " + name);
                break;
            case "promote":
                if (!toggles.promoteCommand) return;
                ChatLib.command("p promote " + name);
                break;
            case "demote":
                if (!toggles.demoteCommand) return;
                ChatLib.command("p demote " + name);
                break;
            case "allinvite":
            case "allinv":
                if (!toggles.allinvCommand) return;
                ChatLib.command("p settings allinvite");
                break;
            case "streamopen":
            case "stream":
                if (!toggles.streamCommand) return;

                num = isNaN(args[1]) ? 10 : args[1];
                ChatLib.command(`stream open ${args[1]}`);
                break;
            default:  // Join instance commands
                if (toggles.instanceCommand == false) return;
                const floors = {
                    1: "one",
                    2: "two",
                    3: "three",
                    4: "four",
                    5: "five",
                    6: "six",
                    7: "seven"
                }
                const tiers = {
                    1: "basic",
                    2: "hot",
                    3: "burning",
                    4: "fiery",
                    5: "infernal"
                }
                const l1 = args[0][0].toLowerCase();
                const l2 = args[0][1];
                args?.[0];

                if (l1 === "m" && l2 in floors) ChatLib.command(`joininstance master_catacombs_floor_${floors[l2]}`);
                else if (l1 === "f" && l2 in floors) ChatLib.command(`joininstance catacombs_floor_${floors[l2]}`);
                else if (l1 === "t" && l2 in tiers) ChatLib.command(`joininstance kuudra_${tiers[l2]}`);
                break;
        }
    }
    
    // MODERATOR COMMANDS
    if (settings.leaderCommands && toggles.inviteCommand && (command === "inv" || command === "invite")) {
        if (data.whitelist.includes(name.toLowerCase())) ChatLib.command(`p ${name}`);
        else ChatLib.command(`r You are not in the whitelist! ${randID}`);
    }

    onCD = true;
    delay(() => onCD = false, 1000);
}

/**
 * Detects when player inputs a ?command and set the chat 
 */
registerWhen(register("chat", (player, message) => {
    if (onCD) return;
    executeCommand(getPlayerName(player), message.split(" "), "pc");
}).setCriteria("Party > ${player}: ?${message}"), () => settings.partyCommands && toggles.partyCommands);
registerWhen(register("chat", (player, message) => {
    if (onCD) return;
    executeCommand(getGuildName(player), message.split(" "), "gc");
}).setCriteria("Guild > ${player}: ?${message}"), () => settings.partyCommands && toggles.guildCommands);
registerWhen(register("chat", (player, message) => {
    if (onCD) return;
    executeCommand(getPlayerName(player), message.split(" "), "r");
}).setCriteria("From ${player}: ?${message}"), () => settings.partyCommands && toggles.dmCommands);
