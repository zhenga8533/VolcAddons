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
        if (settings.bitsAlert === 1 || settings.bitsAlert === 3) Client.showTitle(`${DARK_AQUA + BOLD}NO MO BITS!`, "", 10, 50, 10);
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
        if (container.getName() === "SkyBlock Menu") {
            const cookie = container.getStackInSlot(51).getLore();
            if (!cookie[4].endsWith("Not active!") && cookie[5] !== "§5§o§7Bits Available: §b0") return;
        } else if (container.getName() === "Booster Cookie") {
            const bits = !container.getStackInSlot(11).getLore()[7].startsWith("§5§o§7Bits Available: §b0");
            const active = !(container.getStackInSlot(13).getLore()[20] === "§5§o§7§cYou do not currently have a");
            if (bits && active) return;
        } else return;

        if (settings.bitsAlert === 1 || settings.bitsAlert === 3) Client.showTitle(`${DARK_AQUA + BOLD}NO MO BITS!`, "", 10, 50, 10);
        if (settings.bitsAlert === 2 || settings.bitsAlert === 3) ChatLib.chat(`${LOGO + DARK_AQUA + BOLD}NO MO BITS!`);
    });
}), () => settings.bitsAlert !== 0);
