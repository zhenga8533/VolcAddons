import { BOLD, DARK_AQUA, LOGO } from "../../utils/constants";
import settings from "../../utils/settings";
import { registerWhen } from "../../utils/variables";


/**
 * Variable to track last bits detected
 */
let last = -1;

/**
 * Check the half-hourly bit generation
 */
registerWhen(register("step", () => {
    const bits = Scoreboard.getLines().find(line => line.getName().startsWith("Bits:"));
    if (bits === undefined) return;

    // Check if current amount matches last
    const amount = bits.getName().removeFormatting().replace(/[^0-9]/g, '');
    if (amount === last) {
        if (settings.bitsAlert === 1 || settings.bitsAlert === 3) Client.Companion.showTitle(`${DARK_AQUA + BOLD}NO MO BITS!`, "", 10, 50, 10);
        if (settings.bitsAlert === 2 || settings.bitsAlert === 3) ChatLib.chat(`${LOGO + DARK_AQUA + BOLD}NO MO BITS!`);
    }
    last = amount;
}).setDelay(2700), () => settings.bitsAlert !== 0);

/**
 * Check for inventory bits
 */
registerWhen(register("guiOpened", () => {
    Client.scheduleTask(1, () => {
        const container = Player.getContainer();
        if (container.getName() !== "SkyBlock Menu") return;

        const cookie = container.getStackInSlot(51).getLore();
        const active = cookie.find(line => line.includes("Not active!"));
        const bits = cookie.find(line => line.startsWith("Bits Available:"))?.removeFormatting()?.replace(/[^0-9]/g, '');
        if (active === undefined || bits === 0) return;

        if (settings.bitsAlert === 1 || settings.bitsAlert === 3) Client.Companion.showTitle(`${DARK_AQUA + BOLD}NO MO BITS!`, "", 10, 50, 10);
        if (settings.bitsAlert === 2 || settings.bitsAlert === 3) ChatLib.chat(`${LOGO + DARK_AQUA + BOLD}NO MO BITS!`);
    });
}), () => settings.bitsAlert !== 0);