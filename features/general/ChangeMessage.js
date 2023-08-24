import settings from "../../settings";
import { getMVP } from "../../utils/player";
import { data, registerWhen } from "../../utils/variables";


/**
 * Variables used to represent MVP+ and MVP++ emotes.
 */
const MVP = {
    "<3": "❤",
    ":star:": "✮",
    ":yes:": "✔",
    ":no:": "✖",
    ":java:": "☕",
    ":arrow:": "➜",
    ":shrug:": "¯\_(ツ)_/¯",
    ":tableflip:": "(╯°□°）╯︵ ┻━┻",
    "o/": "( ﾟ◡ﾟ)/",
    ":123:": "123",
    ":totem:": "◎_◎",
    ":typing:": "✎...",
    ":maths:": "√(π+x)=L",
    ":snail:": "@'-'",
    ":thinking:": "(0.o?)",
    ":gimme:": "༼つ ◕_◕ ༽つ",
    ":wizard:": "('-')⊃━☆ﾟ.*･｡ﾟ",
    ":pvp:": "⚔",
    ":peace:": "✌",
    ":oof:": "OOF",
    ":puffer:": "<('O')>",
}
const GIFT = {
    ":snow:": "☃",
    ":dog:": "(ᵔᴥᵔ)",
    ":sloth:": "( ⬩ ⊝ ⬩ )",
    ":dab:": "<o/",
    ":cat:": "= ＾● ⋏ ●＾ =",
    ":yey:": "ヽ (◕◡◕) ﾉ",
    "h/": "ヽ(^◇^*)/",
    ":dj:": "ヽ(⌐■_■)ノ♬",
    ":cute:": "(✿ᴖ‿ᴖ)"
};

/**
 * Replaces all user messages that contains desired emotes.
 *
 * @param {string} message - User sent chat message.
 * @param {Object} event - Message event.
 */
registerWhen(register("messageSent", (message, event) => {
    let contains = false;

    // MVP++ Emotes
    if (!getMVP) {
        Object.keys(MVP).forEach((key) => {
            if (message.includes(key)) {
                message = message.replace(key, MVP[key]);
                contains = true;
            }
        });
    }
    // Rank Gifting Emotes
    Object.keys(GIFT).forEach((key) => {
        if (message.includes(key)) {
            message = message.replace(key, GIFT[key]);
            contains = true;
        }
    });
    // Custom Emotes
    Object.keys(data.emotelist).forEach((key) => {
        if (message.includes(key)) {
            message = message.replace(key, data.emotelist[key]);
            contains = true;
        }
    });

    if (contains) {
        ChatLib.say(message);
        cancel(event);
    }
}), () => settings.enableEmotes === true);

/**
 * Message back lack messaged player with `/b ${msg}`
 */
register("command", (...args) => {
    ChatLib.command(`msg ${data.lastMsg} ${args.join(' ')}`);
}).setName("b", true);

register("messageSent", (message) => {
    const args = message.split(' ');
    if (!(args[0] === "/msg" || args[0] === "/message")) return;
    data.lastMsg = args[1];
});
