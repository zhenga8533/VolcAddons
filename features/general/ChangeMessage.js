import { data } from "../../utils/Data";
import { registerWhen } from "../../utils/RegisterTils";
import Settings from "../../utils/Settings";

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
  ":shrug:": "¯_(ツ)_/¯",
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
};
const GIFT = {
  ":snow:": "☃",
  ":dog:": "(ᵔᴥᵔ)",
  ":sloth:": "( ⬩ ⊝ ⬩ )",
  ":dab:": "<o/",
  ":cat:": "= ＾● ⋏ ●＾ =",
  ":yey:": "ヽ (◕◡◕) ﾉ",
  "h/": "ヽ(^◇^*)/",
  ":dj:": "ヽ(⌐■_■)ノ♬",
  ":cute:": "(✿ᴖ‿ᴖ)",
};
let nextMessage = undefined;

/**
 * Replaces all user messages that contains desired emotes.
 */
registerWhen(
  register("messageSent", (message, event) => {
    if (message === nextMessage) return;
    let contains = false;

    // MVP++ Emotes
    Object.keys(MVP).forEach((key) => {
      if (message.includes(key)) {
        const reg = new RegExp(key, "g");
        message = message.replace(reg, MVP[key]);
        contains = true;
      }
    });
    // Rank Gifting Emotes
    Object.keys(GIFT).forEach((key) => {
      if (message.includes(key)) {
        const reg = new RegExp(key, "g");
        message = message.replace(reg, GIFT[key]);
        contains = true;
      }
    });
    // Custom Emotes
    Object.keys(data.emotelist).forEach((key) => {
      if (message.includes(key)) {
        const reg = new RegExp(key, "g");
        message = message.replace(reg, data.emotelist[key]);
        contains = true;
      }
    });

    if (contains) {
      nextMessage = message;
      ChatLib.say(message);
      cancel(event);
    }
  }),
  () => Settings.enableEmotes
);

/**
 * Message back last messaged player with `/b ${msg}`
 */
let lastMsg = "";
register("command", (...args) => {
  ChatLib.command(`msg ${lastMsg} ${args.join(" ")}`);
}).setName("b", true);

register("messageSent", (message) => {
  const args = message.split(" ");
  if (!(args[0] === "/msg" || args[0] === "/message")) return;
  lastMsg = args[1];
});
