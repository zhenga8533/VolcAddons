import { DARK_GRAY, GOLD, GRAY, GREEN, RED, WHITE } from "../../utils/Constants";
import { data } from "../../utils/Data";
import Location from "../../utils/Location";
import { Overlay } from "../../utils/Overlay";
import { registerWhen } from "../../utils/RegisterTils";
import Settings from "../../utils/Settings";
import { setTitle } from "../../utils/Title";

const drillExample = `§bRefined Divan's Drill
 §7Fuel: §275,750§8/100k
 §7Abilities:
  §6Mining Speed Boost§f §8[§a104§8]
  §6Pickobulus§f §8[§a98§8]`;
const drillOverlay = new Overlay("pickDisplay", data.PDL, "movePick", drillExample);
const cooldowns = {};
const ABILITY_COOLDOWNS = {
  "Mining Speed Boost": 120,
  Pickobulus: 110,
  "Vein Seeker": 60,
  "Maniac Miner": 59,
  "Gemstone Infusion": 140,
  "Hazardous Miner": 140,
};

registerWhen(
  register("step", () => {
    // Update overlay
    drillOverlay.setMessage("");
    const abilities = Object.keys(cooldowns);
    abilities.forEach((key) => {
      if (cooldowns[key] <= 0) return;

      if (--cooldowns[key] === 0) setTitle(`${GOLD + key}`, `${GREEN}is ready to use!`, 10, 50, 10, 52);
    });

    // Check held data
    const held = Player.getHeldItem();
    if (held === null) return;

    const lore = held.getLore();
    if (lore.find((line) => line.startsWith("§5§o§8Breaking Power")) === undefined) return;

    // Begin drill message with fuel
    let drillMessage = held.getName();
    const fuel = lore.find((line) => line.startsWith("§5§o§7Fuel:"));
    if (fuel !== undefined) drillMessage += `\n ${GRAY}Fuel: ${fuel.split(" ")[1]}`;

    //
    drillMessage += `\n ${GRAY}Abilities:`;
    if (abilities.length === 0) {
      const ability = lore.find((line) => line.startsWith("§5§o§6Ability:"));
      if (ability !== undefined)
        drillMessage += `\n  ${
          GOLD + ability.substring(ability.indexOf(" "), ability.indexOf("  §e§lRIGHT CLICK"))
        } ${DARK_GRAY}[${RED}?${DARK_GRAY}]`;
    } else {
      abilities.forEach((key) => {
        const cd = cooldowns[key];
        drillMessage += `\n  ${GOLD + key + WHITE} ${DARK_GRAY}[${(cd > 0 ? RED : GREEN) + cd + DARK_GRAY}]`;
      });
    }

    drillOverlay.setMessage(drillMessage);
  }).setFps(1),
  () => Settings.pickDisplay && ["Dwarven Mines", "Crystal Hollows", "Mineshaft"].includes(Location.getWorld())
);

registerWhen(
  register("chat", (ability) => {
    cooldowns[ability] = ABILITY_COOLDOWNS[ability];
  }).setCriteria("You used your ${ability} Pickaxe Ability!"),
  () => Settings.pickDisplay
);

register("worldLoad", () => {
  Object.keys(cooldowns).forEach((ability) => {
    cooldowns[ability] = Math.round(ABILITY_COOLDOWNS[ability] / 2);
  });
});
