import { AQUA, DARK_AQUA, DARK_GRAY, GRAY } from "../../utils/constants";
import { registerWhen } from "../../utils/register";
import settings from "../../utils/settings";


let xp;
registerWhen(register("step", () => {
    if (!World.isLoaded()) return;

    const levelName = TabList.getNames().find(name => name.startsWith("§r SB Level§r§f:"));
    if (levelName === undefined) return;

    const level = levelName.removeFormatting().trim().split(' ')[3].split('/')[0];
    if (xp === undefined) xp = level;
    else if (level > xp) {
        Client.showTitle(`${AQUA}Skyblock XP Gained!`, `${DARK_GRAY}+${GRAY + (level - xp)} ${DARK_AQUA}XP${DARK_GRAY}!`, 10, 50, 10);
        xp = level;
    }
}).setFps(2), () => settings.levelTitle);

registerWhen(register("chat", (old, now) => {
    Client.showTitle(`${AQUA}Skyblock Level Up!`, `${DARK_AQUA}Level ${DARK_GRAY + old} ➡ [${DARK_AQUA + now + DARK_GRAY}]`, 10, 50, 10);
    xp = undefined;
}).setCriteria("                             Level ${old} ➡ [${now}]"), () => settings.levelTitle);
