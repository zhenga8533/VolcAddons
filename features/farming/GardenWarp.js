import settings from "../../utils/settings";
import { delay } from "../../utils/thread";
import { registerWhen } from "../../utils/variables";
import { getNextVisitor } from "./GardenTab";


/**
 * Variable used to represent last player warp.
 */
let warpTo = "";

/**
 * Overwrites player warp commands with a garden warp whenever next visitor is ready.
 * Will send the player to the original destination once it detects the next visitor timer.
 */
registerWhen(register("messageSent", (message, event) => {
    if (getNextVisitor() || warpTo) return;

    if ((message.includes("/warp") && !message.includes("garden")) || message === "/hub" || message === "/is") {
        cancel(event);
        ChatLib.command("warp garden");
        warpTo = message;
    }
}), () => settings.warpGarden);

/**
 * Attempts to warp the player to a specified location (`warpTo`) if a next visitor is present.
 * Uses a delayed recursive approach to retry warp until a next visitor is available.
 */
function tryWarp() {
    if (getNextVisitor() !== 0) {
        ChatLib.say(warpTo);
        warpTo = "";
    } else delay(() => tryWarp(), 1000);
}
registerWhen(register("worldLoad", () => { tryWarp() }), () => settings.warpGarden);