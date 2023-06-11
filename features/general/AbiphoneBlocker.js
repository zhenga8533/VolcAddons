import settings from "../../settings"
import { data, registerWhen } from "../../utils/variables"
import { LOGO, WHITE } from "../../utils/constants";

let blockRings = false;

// Cancel Text Messages
registerWhen(register("chat", (npc, event) => {
    if (data.blocklist.includes(npc.toLowerCase())) {
        ChatLib.chat(`${LOGO} ${WHITE}Blocked call from ${npc}!`);

        // Set Value to Block Sounds / Ring a Ding Dings
        blockRings = true;
        setTimeout(function () { blockRings = false }, 5000);

        // Cancel Text
        cancel(event);
    }
}).setCriteria("✆ ${npc} ✆ "), () => settings.abiphoneBlocker)

registerWhen(register("chat", (rings, event) => {
    if (!blockRings) return;
    cancel(event);
}).setCriteria("✆ ${rings} [PICK UP]"), () => settings.abiphoneBlocker);

// Cancel Sounds
registerWhen(register("soundPlay", (pos, name, vol, pitch, category, event) => {
    if (!blockRings) return;

    if (name.equals("note.pling"))
        cancel(event);
}), () => settings.abiphoneBlocker);
