import { BOLD, DARK_AQUA, GREEN, RED, WHITE } from "../../utils/Constants";
import { data } from "../../utils/Data";
import { Overlay } from "../../utils/Overlay";
import { registerWhen } from "../../utils/RegisterTils";
import Settings from "../../utils/Settings";
import { Stat, getPaused } from "../../utils/Stat";
import { setTitle } from "../../utils/Title";
import { commafy, formatTime, romanToNum, unformatNumber } from "../../utils/functions/format";

/**
 * Variables to track and display skill tracker overlay.
 */
const skills = {
  None: new Stat("skill"),
  Fishing: new Stat("fishing"),
  Alchemy: new Stat("alchemy"),
  Runecrafting: new Stat("runecrafting"),
  Mining: new Stat("mining"),
  Farming: new Stat("farming"),
  Enchanting: new Stat("enchanting"),
  Taming: new Stat("taming"),
  Foraging: new Stat("foraging"),
  Social: new Stat("social"),
  Carpentry: new Stat("carpentry"),
  Combat: new Stat("combat"),
};
let skillsTracked = skills.Combat.start !== 0;
let current = "None";
const skillExample = `${DARK_AQUA + BOLD}Skill: ${WHITE}None
${DARK_AQUA + BOLD}Gain: ${WHITE}0
${DARK_AQUA + BOLD}Time: ${RED}Inactive
${DARK_AQUA + BOLD}Rate: ${WHITE}0 xp/hr
${DARK_AQUA + BOLD}Level Up: ${GREEN}MAXED`;
const skillOverlay = new Overlay("skillTracker", data.AL, "moveSkills", skillExample);
skillOverlay.setMessage(skillExample);

const xpTable = [
  0, 50, 175, 375, 675, 1175, 1925, 2925, 4425, 6425, 9925, 14925, 22425, 32425, 47425, 67425, 97425, 147425, 222425,
  322425, 522425, 822425, 1222425, 1722425, 2322425, 3022425, 3822425, 4722425, 5722425, 6822425, 8022425, 9322425,
  10722425, 12222425, 13822425, 15522425, 17322425, 19222425, 21222425, 23322425, 25522425, 27822425, 30222425,
  32722425, 35322425, 38072425, 40972425, 44072425, 47472425, 51172425, 55172425, 59472425, 64072425, 68972425,
  74172425, 79672425, 85472425, 91572425, 97972425, 104672425, 111672425,
];

const trackSkills = register("guiOpened", () => {
  Client.scheduleTask(3, () => {
    if (Player.getContainer().getName() !== "Your Skills") return;

    const items = Player.getContainer().getItems();
    items.forEach((item) => {
      if (item === null) return;
      const names = item.getName().removeFormatting().split(" ");
      const skill = names[0];
      const level = romanToNum(names[1]);
      if (!(skill in skills) || isNaN(level)) return;

      const lore = item.getLore();
      const maxIndex = lore.findIndex((line) => line === "§5§o§7§8Max Skill level reached!");
      const progressIndex = lore.findIndex((line) => line.startsWith("§5§o§7Progress"));
      const xp =
        parseFloat(
          maxIndex !== -1
            ? lore[maxIndex + 1].split("§6")[1].replace(/,/g, "")
            : lore[progressIndex + 1].split("§e")[1].split("§6")[0].replace(/,/g, "")
        ) + (maxIndex !== -1 ? 0 : xpTable[level]);

      skills[skill].level = level;
      skills[skill].start = xp;
      skills[skill].now = xp;
      skills[skill].since = 600;
    });

    skillsTracked = true;
    trackSkills.unregister();
    if (Settings.skillTracker !== 0) setTitle(`${GREEN}Skills tracked!`, "Now begin the grind.", 10, 50, 10, 80);
  });
});
if (skillsTracked) trackSkills.unregister();

registerWhen(
  register("chat", () => {
    skillsTracked = false;
    trackSkills.register();
  }).setCriteria("Switching to profile ${profile}..."),
  () => Settings.skillTracker !== 0
);

/**
 * Resets skill overlay to base state.
 */
register("command", () => {
  skillsTracked = false;
  trackSkills.register();

  Object.keys(skills).forEach((skill) => {
    skills[skill].time = 0;
    skills[skill].since = 600;
  });
  setTitle(`${GREEN}Successfully reset skills!`, "Please open skills menu to retrack.", 10, 50, 10, 81);
}).setName("resetSkills");

/**
 * Uses action bar to detect skill xp gains for maxed out skills.
 */
registerWhen(
  register("actionBar", (health, gain, type, amount, next, mana) => {
    if (!skillsTracked) {
      setTitle(`${RED}Skills not tracked!`, "Please open skills menu to track.", 0, 50, 10, 79);
      return;
    }
    if (getPaused()) return;

    // Update info
    current = type;
    const skill = skills[current];
    if (skill === undefined) return;

    // Update info
    amount = unformatNumber(amount);
    skill.now = xpTable[skill.level] + amount;
    skill.since = 0;
  }).setCriteria("${health}+${gain} ${type} (${amount}/${next})${mana}"),
  () => Settings.skillTracker !== 0
);

/**
 * Uses action bar to detect skill xp gains for non maxed out skills.
 */
registerWhen(
  register("actionBar", (health, gain, type, percent, mana) => {
    if (!skillsTracked) {
      setTitle(`${RED}Skills not tracked!`, "Please open skills menu to track.", 0, 50, 10, 79);
      return;
    }
    if (getPaused()) return;

    // Update info;
    current = type;
    const skill = skills[current];
    if (skill === undefined) return;

    // Update info
    percent = parseFloat(percent) / 100;
    skill.now = xpTable[skill.level + 1] - (xpTable[skill.level + 1] - xpTable[skill.level]) * (1 - percent);
    skill.since = 0;
  }).setCriteria("${health}+${gain} ${type} (${percent}%)${mana}"),
  () => Settings.skillTracker !== 0
);

/**
 * Tracks skill level ups
 */
registerWhen(
  register("chat", (skill) => {
    skills[skill].level += 1;
  }).setCriteria("  SKILL LEVEL UP ${skill} ${from}➜${to}"),
  () => Settings.skillTracker !== 0
);

/**
 * Updates skill tracker data every second.
 */
registerWhen(
  register("step", () => {
    if (getPaused() || current === "None") return;

    // Update tracker
    let skill = skills[current];
    if (skill === undefined) return;
    const rate = skill.getRate();

    if (skill.since < Settings.skillTracker * 60) {
      skill.since += 1;
      skill.time += 1;
    }

    // Set HUD
    const timeDisplay = skill.since < Settings.skillTracker * 60 ? formatTime(skill.time) : `${RED}Inactive`;
    let skillMessage = `${DARK_AQUA + BOLD}Skill: ${WHITE + current}
${DARK_AQUA + BOLD}Gain: ${WHITE + commafy(skill.getGain())} xp
${DARK_AQUA + BOLD}Time: ${WHITE + timeDisplay}
${DARK_AQUA + BOLD}Rate: ${WHITE + commafy(rate)} xp/hr
${DARK_AQUA + BOLD}Level Up: `;

    // Set time until next
    if (skill.level !== 60) {
      const neededXP = xpTable[skill.level + 1] - skill.now;
      if (neededXP > 0) skillMessage += `${WHITE + formatTime((neededXP / rate) * 3600)}`;
      else skillMessage += `${GREEN}MAXED`;
    } else skillMessage += `${GREEN}MAXED`;

    skillOverlay.setMessage(skillMessage);
  }).setFps(1),
  () => Settings.skillTracker !== 0
);
