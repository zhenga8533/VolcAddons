import settings from "../../settings";
import { delay } from "../../utils/thread";
import { registerWhen } from "../../utils/variables";
import { getNextVisitor } from "./GardenTab";

let warpTo = "";
registerWhen(register("messageSent", (message, event) => {
    if (getNextVisitor() || warpTo) return;

    if (message.includes("/warp") && !message.includes("garden")) {
        cancel(event);
        ChatLib.command("warp garden");
        warpTo = message;
    }
}), () => settings.warpGarden);

registerWhen(register("worldLoad", () => {
    delay(() => {
        ChatLib.say(warpTo);
        warpTo = "";
    }, 1000);
}), () => settings.warpGarden);