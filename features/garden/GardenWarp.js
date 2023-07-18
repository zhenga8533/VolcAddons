import settings from "../../settings";
import { delay } from "../../utils/thread";
import { registerWhen } from "../../utils/variables";
import { getNextVisitor } from "./GardenTab";

let warpTo = "";
registerWhen(register("messageSent", (message, event) => {
    if (getNextVisitor() || warpTo) return;

    if ((message.includes("/warp") && !message.includes("garden")) || message == "/hub" || message == "/is") {
        cancel(event);
        ChatLib.command("warp garden");
        warpTo = message;
    }
}), () => settings.warpGarden);

function tryWarp() {
    if (getNextVisitor() != 0) {
        ChatLib.say(warpTo);
        warpTo = "";
    } else delay(() => tryWarp(), 1000);
}
registerWhen(register("worldLoad", () => { tryWarp() }), () => settings.warpGarden);