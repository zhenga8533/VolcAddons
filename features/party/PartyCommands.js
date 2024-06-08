import axios from "../../../axios";
import party from "../../utils/Party";
import Settings from "../../utils/Settings";
import toggles from "../../utils/Toggles";
import { AQUA, DARK_AQUA, LOGO, RED, WHITE, YELLOW } from "../../utils/Constants";
import { getGuildName, getPlayerName } from "../../utils/functions/player";
import { registerWhen } from "../../utils/RegisterTils";
import { delay } from "../../utils/ThreadTils";
import { data } from "../../utils/Data";
import { getPing, getTPS } from "../general/Performance";


/**
 * Variable used to represent /pc cooldown and possible responses.
 */
let onCD = false;
const RESPONSES = JSON.parse(FileLib.read("VolcAddons", "json/8ball.json"));
const RPS = ["rock", "paper", "scissors"];
const QUOTES = JSON.parse(FileLib.read("VolcAddons", "json/quotes.json"));
const W = ["waifu", "neko", "shinobu", "megumin", "bully", "cuddle", "cry", "hug", "awoo", "kiss", "lick", "pat", "smug", "bonk", "yeet", 
    "blush", "smile", "wave", "highfive", "handhold", "nom", "bite", "glomp", "slap", "kill", "kick", "happy", "wink", "poke", "dance", "cringe"];

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
            const category = toggles.womenCommand;
            if (category === 0) return;
            
            const arg = W.includes(args[1]) ? args[1] :
                category === 1 ? W[Math.floor(Math.random() * (W.length - 1))] : W[category - 2];
            axios.get(`https://api.waifu.pics/sfw/${arg}`).then(w => {
                const waifu = w.data.url.split('/')[3].replace('.', '@');
                if (sendTo !== false) ChatLib.command(`${sendTo} va-${waifu}-w ${randID}`);
                else ChatLib.command(`msg ${Player.getName()} va-${waifu}-w`);
            });
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
            if (!toggles.limboCommand || party.getLeader() || Player.getName() === name) return;

            ChatLib.command("l");
            break;
        case "leave":
            if (!toggles.limboCommand || party.getLeader() || Player.getName() === name) return;

            ChatLib.command("p leave");
            break;
        case "help":
            if (!toggles.helpCommand || !sendTo) return;

            ChatLib.command(`${sendTo} Party Commands: ?<dice, coin, 8ball, rps, w, lobby, leave, xyz, help> ${randID}`);
            if (party.getLeader() && Settings.leaderCommands)
                delay(() => ChatLib.command(`${sendTo} Leader Commands: ?<warp, transfer, promote, demote, allinv, stream> ${randID}`), 690);
            break;
        default:
            // Check for unique ?w commands
            const wIndex = W.indexOf(command)
            if (toggles.womenCommand === 0 || wIndex === -1) return;

            if (sendTo !== false) ChatLib.command(`${sendTo} ${imgur} ${randID}-vaw`);
            // Randomize end to avoid duplicate message ^
            sendWaifu(wIndex + 2);
            break;
    } }, 690);
    
    // LEADER COMMANDS
    if (!sendTo || (sendTo === "pc" && party.getLeader() && Settings.leaderCommands && Player.getName() !== name)) {
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
            case "pm":
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
    if (Settings.leaderCommands && toggles.inviteCommand && (command === "inv" || command === "invite")) {
        if (data.whitelist.includes(name.toLowerCase())) ChatLib.command(`p ${name}`);
        else ChatLib.command(`r You are not in the whitelist! ${randID}`);
    }

    onCD = true;
    delay(() => onCD = false, 1000);
}

/**
 * Parse out rand ID of messages
 */
register("chat", (player, msg, id, event) => {
    if (id.length !== 12 || id.includes(' ') || msg.endsWith('-w ')) return;

    cancel(event);
    ChatLib.chat(`&${player}:${msg}`);
}).setCriteria("&${player}:${msg}@${id}");

/**
 * Detects when player inputs a ?command and set the chat 
 */
data.prefixlist.forEach(prefix => {
    const colorRegex = "&${color}";
    const playerRegex = "${player}";
    const messageRegex = "${message}";

    registerWhen(register("chat", (player, _, message) => {
        if (onCD) return;
        executeCommand(getPlayerName(player), message.split(" "), "ac");
    }).setCriteria(`&r${playerRegex + colorRegex}: ${prefix + messageRegex}&r`), () => Settings.partyCommands && toggles.allCommands);
    registerWhen(register("chat", (player, message) => {
        if (onCD) return;
        executeCommand(getPlayerName(player), message.split(" "), "pc");
    }).setCriteria(`Party > ${playerRegex}: ${prefix + messageRegex}`), () => Settings.partyCommands && toggles.partyCommands);
    registerWhen(register("chat", (player, message) => {
        if (onCD) return;
        executeCommand(getGuildName(player), message.split(" "), "gc");
    }).setCriteria(`Guild > ${playerRegex}: ${prefix + messageRegex}`), () => Settings.partyCommands && toggles.guildCommands);
    registerWhen(register("chat", (player, message) => {
        if (onCD) return;
        executeCommand(getPlayerName(player), message.split(" "), "r");
    }).setCriteria(`From ${playerRegex}: ${prefix + messageRegex}`), () => Settings.partyCommands && toggles.dmCommands);
});


/**
 * ?w image rendering.
 */
let img = undefined;
let imgUrl = undefined;

const render = register("renderOverlay", () => {
    if (img === undefined) {
        Renderer.translate(0, 0, 999);
        Renderer.drawString("Loading...", Client.getMouseX() + 9, Client.getMouseY() + 3, true);
        return;
    }

    const SCREEN_WIDTH = Renderer.screen.getWidth();
    const SCREEN_HEIGHT = Renderer.screen.getHeight();
    const imgWidth = img.getTextureWidth();
    const imgHeight = img.getTextureHeight();
    const ratio =  (imgWidth / SCREEN_WIDTH > imgHeight / SCREEN_HEIGHT ? imgWidth / SCREEN_WIDTH : imgHeight / SCREEN_HEIGHT);
    const width = imgWidth / ratio;
    const height = imgHeight / ratio;
    const x = Client.getMouseX() + width > SCREEN_WIDTH ? SCREEN_WIDTH - width : Client.getMouseX();
    const y = Client.getMouseY() - height < 0 ? 0 : Client.getMouseY() - height;

    Renderer.translate(0, 0, 999);
    img.draw(x, y, width, height);
}).unregister();

const close = register("guiClosed", () => {
    img = undefined;
    imgUrl = undefined;
    render.unregister();
    close.unregister()
}).unregister();

register("chatComponentHovered", (text) => {
    const hoverValue = text.getHoverValue().removeFormatting();
    
    if (hoverValue === imgUrl || !hoverValue.startsWith("https://i.waifu.pics")) return;
    imgUrl = hoverValue;
    delay(() => {
        try {
            render.register();
            close.register();
            img = Image.fromUrl(hoverValue);
        } catch (err) {
            ChatLib.chat(`${LOGO + RED}Error: Unable to load image!`);
        }
    }, 1);
})

register("chat", (player, _, id, __, event) => {
    cancel(event);
    const link = `https://i.waifu.pics/${id.replace('@', '.')}`;
    new TextComponent(`&${player}&f: ${link}`).setHoverValue(link).chat();
}).setCriteria("&${player}:${space}va-${id}-w${end}");
