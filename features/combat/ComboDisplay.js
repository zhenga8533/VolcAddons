import settings from "../../settings";
import { AQUA, BOLD, DARK_AQUA, DARK_GRAY, GOLD } from "../../utils/constants";
import { Overlay } from "../../utils/overlay";
import { data, registerWhen } from "../../utils/variables";


const comboExample =
`${GOLD}${BOLD}+34 Kill Combo
  ${AQUA}+69✯ Magic Find
  ${DARK_GRAY}+${GOLD}420 coins per kill
  ${DARK_AQUA}+911☯ Combat Wisdom`;
const comboOverlay = new Overlay("comboDisplay", ["all"], () => true, data.WL, "moveCombo", comboExample);
comboOverlay.message = "";
let stats = ["", 0, 0, 0];

function updateOverlay() {
    comboOverlay.message = stats[0];
    if (stats[1] !== 0) comboOverlay.message += `\n${AQUA}+${stats[1]}✯ Magic Find`;
    if (stats[2] !== 0) comboOverlay.message += `\n${DARK_AQUA}+${stats[2]}☯ Combat Wisdom`;
    if (stats[3] !== 0) comboOverlay.message += `\n${DARK_GRAY}+${GOLD}${stats[3]} coins per kill`;
}

registerWhen(register("chat", (color, kills, bonus, event) => {
    const stat = bonus.split(' ')[0].removeFormatting();
    const amount = parseInt(stat.replace(/[^0-9]/g, ''));
    if (stat.includes('✯')) stats[1] += amount;
    else if (stat.includes('☯')) stats[2] += amount;
    else stats[3] += amount;

    cancel(event);
    stats[0] = `${color}${BOLD}${kills}:`;
    updateOverlay();
}).setCriteria("&r${color}&l+${kills} &r&8${bonus}&r"), () => settings.comboDisplay);

registerWhen(register("chat", (color, kills) => {
    stats[0] = `${color}${kills} Kill Combo:`;
    updateOverlay();
}).setCriteria("&r${color}+${kills} Kill Combo&r"), () => settings.comboDisplay);

registerWhen(register("chat", () => {
    stats = ["", 0, 0, 0];
    comboOverlay.message = "";
}).setCriteria("Your Kill Combo has expired! You reached a ${kills} Kill Combo!"), () => settings.comboDisplay);

registerWhen(register("worldUnload", () => {
    stats = ["", 0, 0, 0];
    comboOverlay.message = "";
}), () => settings.comboDisplay);
