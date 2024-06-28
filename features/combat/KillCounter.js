import { BOLD, DARK_RED, EntityArmorStand, GRAY, GREEN, LOGO, RED, RESET } from "../../utils/Constants";
import { data } from "../../utils/Data";
import { Overlay } from "../../utils/Overlay";
import { registerWhen } from "../../utils/RegisterTils";
import Settings from "../../utils/Settings";
import { getPaused } from "../../utils/Stat";
import { formatNumber, formatTime } from "../../utils/functions/format";

/**
 * Variables used to track and display item and vanquisher kill counts.
 */
const stands = new Set();
let mobs = {};
let items = {};
let total = 0;
let time = 0;
const counterExample = `${RED + BOLD}メリオダス: ${RESET}0/0
${RED + BOLD}ディアンヌ: ${RESET}∞/∞
${RED + BOLD}バン: ${RESET}0*∞
${RED + BOLD}キング: ${RESET}1^∞
${RED + BOLD}マーリン: ${RESET}∞^0
${RED + BOLD}エスカノール: ${RESET}∞-∞
${RED + BOLD}ゴウセル: ${RESET}0^0

${DARK_RED + BOLD}Total: ${RESET}∞^∞
${DARK_RED + BOLD}Time: ${RESET}-∞`;
const counterOverlay = new Overlay("killCounter", data.JL, "moveKills", counterExample);
counterOverlay.setMessage("");

function updateCounter() {
  // Sort the mobs object
  const sortedMobs = Object.keys(mobs).sort((a, b) => mobs[b] - mobs[a]);

  // Format overlay + change message
  const messageLines = sortedMobs.map((mob) => {
    const kills = mobs[mob];
    return `${RED + BOLD + mob}: ${RESET + formatNumber(kills) + GRAY} (${formatNumber((kills / time) * 3600)}/hr)`;
  });

  counterOverlay.setMessage(
    messageLines.join("\n") +
      `\n\n${DARK_RED + BOLD}Total: ${RESET + formatNumber(total) + GRAY} (${formatNumber((total / time) * 3600)}/hr)` +
      `\n${DARK_RED + BOLD}Time: ${RESET + formatTime(time)}`
  );
}

/**
 * Uses the "Book of Stats" to track whenever player mobs an entity and updates the Vanquisher Overlay.
 */
registerWhen(
  register("entityDeath", (death) => {
    // Check return
    const held = Player.getHeldItem();
    if (held === null) return;
    const heldName = held.getRegistryName();
    if (Player.asPlayerMP().distanceTo(death) > 16 && !heldName.endsWith("hoe") && !heldName.endsWith("bow")) return;

    // Load held item stats (book of stats)
    const extraAttributes = held.getNBT().getCompoundTag("tag").getCompoundTag("ExtraAttributes");
    const heldItemId = extraAttributes.getString("id");
    const newKills = extraAttributes.getInteger("stats_book");

    if (!(heldItemId in items)) {
      items[heldItemId] = newKills;
      return;
    }

    const killsDiff = Math.abs(newKills - items[heldItemId]);
    if (killsDiff === 0) return;

    // Get surrounding death to find title stand
    const deathEntity = death.getEntity();
    World.getWorld()
      .func_72839_b(deathEntity, deathEntity.func_174813_aQ().func_72314_b(1, 3, 1))
      .filter(
        (entity) =>
          entity instanceof EntityArmorStand &&
          entity?.func_95999_t()?.removeFormatting().endsWith("❤") &&
          !stands.has(entity.persistentID)
      )
      .forEach((entity) => {
        const title = entity?.func_95999_t()?.removeFormatting();
        const name = title
          .replace(/[^a-zA-Z ]/g, "")
          .split(" ")
          .slice(0, -1)
          .join(" ")
          .replace("Lv ", "");

        if (name in mobs) mobs[name]++;
        else mobs[name] = 1;

        total++;
        items[heldItemId]++;
        updateCounter();
        stands.add(entity.persistentID);
      });
  }),
  () => Settings.killCounter
);

/**
 * Track time and reset stand ids
 */
registerWhen(
  register("step", () => {
    if (Object.keys(mobs).length === 0 || getPaused()) return;

    time++;
    updateCounter();
    stands.clear();
  }).setFps(1),
  () => Settings.vanqCounter !== 0
);

/**
 * Command to reset the stats for the overall counter.
 */
register("command", () => {
  mobs = {};
  total = 0;
  time = 0;
  counterOverlay.setMessage("");
  ChatLib.chat(`${LOGO + GREEN}Successfully reset kill counter!`);
}).setName("resetKills");
