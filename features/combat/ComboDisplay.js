import { AQUA, BOLD, DARK_AQUA, DARK_GRAY, GOLD } from "../../utils/Constants";
import { data } from "../../utils/Data";
import { Overlay } from "../../utils/Overlay";
import { registerWhen } from "../../utils/RegisterTils";
import Settings from "../../utils/Settings";

/**
 * Variables used to track and display combo count and stats.
 */
const comboExample = `${GOLD + BOLD}+34 Kill Combo
  ${AQUA}+69✯ Magic Find
  ${DARK_GRAY}+${GOLD}420 coins per kill
  ${DARK_AQUA}+911☯ Combat Wisdom`;
const comboOverlay = new Overlay("comboDisplay", data.WL, "moveCombo", comboExample);
comboOverlay.setMessage("");
let stats = ["", 0, 0, 0];

/**
 * Resets and updates overlay message to match stats.
 */
function updateOverlay() {
  let comboMessage = "";
  comboMessage = stats[0];
  if (stats[1] !== 0) comboMessage += `\n${AQUA}+${stats[1]}✯ Magic Find`;
  if (stats[2] !== 0) comboMessage += `\n${DARK_AQUA}+${stats[2]}☯ Combat Wisdom`;
  if (stats[3] !== 0) comboMessage += `\n${DARK_GRAY}+${GOLD + stats[3]} coins per kill`;

  comboOverlay.setMessage(comboMessage);
}

/**
 * Processes chat messages and updates statistics based on provided information.
 */
registerWhen(
  register("chat", (color, kills, bonus, event) => {
    const stat = bonus.split(" ")[0].removeFormatting();
    const amount = parseInt(stat.replace(/[^0-9]/g, ""));
    if (stat.includes("✯")) stats[1] += amount;
    else if (stat.includes("☯")) stats[2] += amount;
    else stats[3] += amount;

    cancel(event);
    stats[0] = `${color + BOLD + kills}:`;
    updateOverlay();
  }).setCriteria("&r${color}&l+${kills} &r&8${bonus}&r"),
  () => Settings.comboDisplay
);

/**
 * Updates overlay with formatted kill combo message.
 */
registerWhen(
  register("chat", (color, kills) => {
    stats[0] = `${color + kills} Kill Combo:`;
    updateOverlay();
  }).setCriteria("&r${color}+${kills} Kill Combo&r"),
  () => Settings.comboDisplay
);

/**
 * Resets statistics and overlay message.
 */
registerWhen(
  register("chat", () => {
    stats = ["", 0, 0, 0];
    comboOverlay.setMessage("");
  }).setCriteria("Your Kill Combo has expired! You reached a ${kills} Kill Combo!"),
  () => Settings.comboDisplay
);
registerWhen(
  register("worldUnload", () => {
    stats = ["", 0, 0, 0];
    comboOverlay.setMessage("");
  }),
  () => Settings.comboDisplay
);
