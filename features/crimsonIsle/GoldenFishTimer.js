import { BOLD, DARK_RED, GOLD, RESET, WHITE } from "../../utils/Constants";
import { data } from "../../utils/Data";
import location from "../../utils/Location";
import { Overlay } from "../../utils/Overlay";
import { registerWhen } from "../../utils/RegisterTils";
import Settings from "../../utils/Settings";
import { formatTime } from "../../utils/functions/format";

/**
 * Variables used to track and display fishing timer.
 */
let lastCast = 0;
let lastFish = 0;
const fishExample = `${GOLD + BOLD}Last Cast: ${RESET}Yee
${GOLD + BOLD}Last Fish: ${RESET}Haw`;
const fishOverlay = new Overlay("goldenFishAlert", data.TL, "moveGolden", fishExample, ["Crimson Isle"]);

/**
 * Increments time and updates Golden Fish Overlay every second.
 */
registerWhen(
  register("step", () => {
    lastCast += 1;
    lastFish += 1;
    if (lastCast > 270) lastFish = 0;

    fishOverlay.setMessage(
      `${GOLD + BOLD}Last Cast: ${lastCast > 240 ? DARK_RED : WHITE + formatTime(lastCast)}
${GOLD + BOLD}Last Fish: ${RESET + formatTime(lastCast > 270 ? 0 : lastFish)}`
    );
  }).setFps(1),
  () => location.getWorld() === "Crimson Isle" && Settings.goldenFishAlert
);

/**
 * Resets "lastCast" variable whenever player right clicks with a fishing rod in hand.
 */
registerWhen(
  register("clicked", (x, y, button, state) => {
    if (!button || !state || Player.getHeldItem() === null) return;

    if (
      Player.getHeldItem()
        .getNBT()
        .getCompoundTag("tag")
        .getCompoundTag("ExtraAttributes")
        .getString("id")
        .includes("ROD")
    )
      lastCast = 0;
  }),
  () => location.getWorld() === "Crimson Isle" && Settings.goldenFishAlert
);

/**
 * Resets "lastFish" variable whenever the Golden Fish message appears in chat.
 */
registerWhen(
  register("chat", () => {
    lastFish = 0;
  }).setCriteria("You spot a Golden Fish surface from beneath the lava!"),
  () => location.getWorld() === "Crimson Isle" && Settings.goldenFishAlert
);
