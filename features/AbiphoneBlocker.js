import settings from "../settings"
import { data } from "../utils/variables"
import { LOGO, WHITE } from "../utils/constants";

let blockRings = false;

// Cancel Text Messages
register("chat", (npc, event) => {
    if (!settings.abiphoneBlocker) return;

    if (data.blocklist.includes(npc.toLowerCase())) {
        ChatLib.chat(`${LOGO} ${WHITE}Blocked call from ${npc}!`);

        // Set Value to Block Sounds / Ring a Ding Dings
        blockRings = true;
        setTimeout(function () { blockRings = false }, 5000);

        // Cancel Text
        cancel(event);
    }
}).setCriteria("✆ ${npc} ✆ ");

register("chat", (rings, event) => {
    if (!settings.abiphoneBlocker || !blockRings) return;
    cancel(event);
}).setCriteria("✆ ${rings} [PICK UP]");

// Cancel Sounds
register("soundPlay", (pos, name, vol, pitch, category, event) => {
    if (!settings.abiphoneBlocker || !blockRings) return;

    if (name.equals("note.pling"))
        cancel(event);
})