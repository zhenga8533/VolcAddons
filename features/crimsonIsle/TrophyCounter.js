import {
  AQUA,
  BLUE,
  BOLD,
  DARK_AQUA,
  DARK_GRAY,
  DARK_PURPLE,
  GOLD,
  GRAY,
  GREEN,
  LOGO,
  WHITE,
} from "../../utils/Constants";
import { data } from "../../utils/Data";
import location from "../../utils/Location";
import { Overlay } from "../../utils/Overlay";
import { registerWhen } from "../../utils/RegisterTils";
import Settings from "../../utils/Settings";
import { getPaused } from "../../utils/Stat";
import { convertToTitleCase } from "../../utils/functions/format";

/**
 * Variables used to format and display trophy fishes.
 */
const trophyExample = `&6&lTrophy Fishing:
&fBlobfish&f: &323477 &816649 &76249 &6518 &b61
&fGusher&f: &39627 &86838 &72556 &6210 &b23
&9Lava Horse&f: &36831 &84939 &71733 &6143 &b16
&9Mana Ray&f: &31487 &81076 &7380 &630 &b1
&fObfuscated Fish 1&f: &31423 &81056 &7339 &625 &b3
&aSlugfish&f: &31000 &8716 &7260 &623 &b1
&9Vanille&f: &31000 &8734 &7244 &621 &b1
&5Karate Fish&f: &3974 &8697 &7259 &617 &b1
&9Obfuscated Fish 3&f: &3961 &8681 &7257 &622 &b1
&aObfuscated Fish 2&f: &3846 &8588 &7243 &612 &b3
&5Skeleton Fish&f: &3717 &8520 &7173 &623 &b1
&9Volcanic Stonefish&f: &3451 &8316 &7122 &612 &b1
&fSulphur Skitter&f: &3446 &8326 &7109 &610 &b1
&6Golden Fish&f: &3437 &8298 &7127 &611 &b1
&aFlyfish&f: &3214 &8144 &766 &63 &b1
&fSteaming Hot Flounder&f: &3111 &879 &730 &61 &b1
&5Soul Fish&f: &373 &850 &720 &61 &b2
&5Moldfin&f: &360 &837 &721 &61 &b1`;
const trophyOverlay = new Overlay("trophyCounter", data.FL, "moveTrophy", trophyExample, ["Crimson Isle"]);
trophyOverlay.setMessage("");

/**
 * Variables used for formatting
 */
const TROPHY_COLORS = {
  blobfish: WHITE,
  gusher: WHITE,
  skeleton_fish: DARK_PURPLE,
  lava_horse: BLUE,
  golden_fish: GOLD,
  mana_ray: BLUE,
  flyfish: GREEN,
  obfuscated_fish_1: WHITE,
  obfuscated_fish_2: GREEN,
  volcanic_stonefish: BLUE,
  steaming_hot_flounder: WHITE,
  sulphur_skitter: WHITE,
  moldfin: DARK_PURPLE,
  soul_fish: DARK_PURPLE,
  vanille: BLUE,
  obfuscated_fish_3: BLUE,
  karate_fish: DARK_PURPLE,
  slugfish: GREEN,
};
const TROPHY_ID = {
  lavahorse: "lava_horse",
  obfuscated_1: "obfuscated_fish_1",
  obfuscated_2: "obfuscated_fish_2",
  obfuscated_3: "obfuscated_fish_3",
  "steaming-hot_flounder": "steaming_hot_flounder",
};
const TIER_INDEX = {
  bronze: 1,
  silver: 2,
  gold: 3,
  diamond: 4,
};

/**
 * Variables used to track trophy fishes/
 */
let sessionTrophy = {};
let timePassed = 0;
register("command", () => {
  sessionTrophy = {};
  timePassed = 0;
  trophyOverlay.setMessage("");
  ChatLib.chat(`${LOGO + GREEN}Successfully reset trophy fish counter!`);
}).setName("resetTrophy");

/**
 * Update trophyOverlay message using inputted trophy data.
 */
function updateMessage() {
  const sortedTrophy = Object.entries(sessionTrophy)
    .sort((a, b) => b[1][0] - a[1][0])
    .reduce((sorted, [fish, fishData]) => {
      if (fishData[0] !== 0) {
        const title = TROPHY_COLORS[fish] + convertToTitleCase(fish);
        const [total, bronze, silver, gold, diamond] = fishData;
        const rate = `${GRAY}- ${WHITE + ((total * 3600) / timePassed).toFixed(0)}/hr`;
        sorted.push(
          `${title + WHITE}: ${DARK_AQUA + total} ${DARK_GRAY + bronze} ${GRAY + silver} ${GOLD + gold} ${
            AQUA + diamond
          } ${rate}`
        );
      }
      return sorted;
    }, []);

  if (sortedTrophy.length != 0) trophyOverlay.setMessage(`${GOLD + BOLD}Trophy Fishing:\n${sortedTrophy.join("\n")}`);
}

/**
 * Update counter variables.
 *
 * @param {String} fish - Fish type and tier.
 */
function updateCounter(fish) {
  const args = fish.toLowerCase().split(" ");
  const tier = args.pop();
  let type = args.join("_");
  if (type in TROPHY_ID) type = TROPHY_ID[type];

  // Update Session
  if (!(type in sessionTrophy)) sessionTrophy[type] = [0, 0, 0, 0, 0];
  sessionTrophy[type][0]++;
  sessionTrophy[type][TIER_INDEX[tier]]++;
  updateMessage();
}

/**
 * Track fishing messages to update counter.
 */
registerWhen(
  register("chat", (fish) => {
    updateCounter(fish);
  }).setCriteria("TROPHY FISH! You caught a ${fish}."),
  () => location.getWorld() === "Crimson Isle" && Settings.trophyCounter
);

registerWhen(
  register("chat", (fish) => {
    updateCounter(fish);
  }).setCriteria("NEW DISCOVERY: ${fish}"),
  () => location.getWorld() === "Crimson Isle" && Settings.trophyCounter
);

/**
 * Update time for session view
 */
registerWhen(
  register("step", () => {
    if (getPaused()) return;
    if (Object.keys(sessionTrophy).length !== 0) timePassed++;
    updateMessage();
  }).setFps(1),
  () => location.getWorld() === "Crimson Isle" && Settings.trophyCounter
);
