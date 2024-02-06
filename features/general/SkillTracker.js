import settings from "../../utils/settings";
import { BOLD, DARK_AQUA, GREEN, LOGO, RED, WHITE } from "../../utils/constants";
import { findGreaterIndex } from "../../utils/functions/find";
import { commafy, convertToTitleCase, getTime, unformatNumber } from "../../utils/functions/format";
import { Overlay } from "../../utils/overlay";
import { Stat, data, getPaused, registerWhen } from "../../utils/variables";
import { getWorld } from "../../utils/worlds";


/**
 * Variables to track and display skill tracker overlay.
 */
const skills = {
    "None": new Stat(),
    "Fishing": new Stat(),
    "Alchemy": new Stat(),
    "Runecrafting": new Stat(),
    "Mining": new Stat(),
    "Farming": new Stat(),
    "Enchanting": new Stat(),
    "Taming": new Stat(),
    "Foraging": new Stat(),
    "Social": new Stat(),
    "Carpentry": new Stat(),
    "Combat": new Stat()
}
let current = "None";
const skillExample =
`${DARK_AQUA + BOLD}Skill: ${WHITE}None
${DARK_AQUA + BOLD}XP Gained: ${WHITE}0
${DARK_AQUA + BOLD}Time Passed: ${RED}Inactive
${DARK_AQUA + BOLD}Rate: ${WHITE}0 xp/hr
${DARK_AQUA + BOLD}Level Up: ${GREEN}MAXED`;
const skillOverlay = new Overlay("skillTracker", ["all"], () => getWorld() !== undefined, data.AL, "moveSkills", skillExample);

const xpTable = [0, 50, 175, 375, 675, 1175, 1925, 2925, 4425, 6425, 9925, 14925, 22425, 32425, 47425, 67425, 97425, 147425, 222425, 322425, 522425, 822425, 1222425, 
    1722425, 2322425, 3022425, 3822425, 4722425, 5722425, 6822425, 8022425, 9322425, 10722425, 12222425, 13822425, 15522425, 17322425, 19222425, 21222425, 23322425, 
    25522425, 27822425, 30222425, 32722425, 35322425, 38072425, 40972425, 44072425, 47472425, 51172425, 55172425, 59472425, 64072425, 68972425, 74172425, 79672425, 
    85472425, 91572425, 97972425, 104672425, 111672425];

/**
 * Sets the current skill level of player profile.
 * 
 * @param {Object} data - Skill API data of current player profile.
 */
export function updateSkills(data) {
    if (data === undefined) return;

    Object.keys(data).forEach(key => {
        const skill = convertToTitleCase(key.split('_')[1]);
        const xp = parseFloat(data[key]);
        const index = findGreaterIndex(xpTable, xp);
        skills[skill].level = index;
        skills[skill].start = xp;
        skills[skill].now = xp;
        skills[skill].since = 600;
    });
}

/**
 * Resets skill overlay to base state.
 */
register("command", () => {
    request({
        url: `https://api.hypixel.net/v2/skyblock/profile?key=4e927d63a1c34f71b56428b2320cbf95&profile=${id}`,
        json: true
    }).then(response => {
        const data = response.profile.members[getPlayerUUID()];
        updateSkills(data?.player_data?.experience);
        ChatLib.chat(`${LOGO + GREEN}Successfully reset skill tracker!`);
    }).catch(err => console.error(`VolcAddons: ${err.cause ?? err}`));
}).setName("resetSkills");

/**
 * Uses action bar to detect skill xp gains for maxed out skills.
 */
registerWhen(register("actionBar", (health, gain, type, amount, next, mana) => {
    if (getPaused()) return;

    // Update info
    current = type;
    const skill = skills[current];
    if (skill === undefined) return;
    
    // Update info
    amount = unformatNumber(amount);
    skill.now = skill.level === 60 ? xpTable[60] + amount : xpTable[skill.level + 1] - unformatNumber(next) + amount;
    skill.since = 0;
}).setCriteria("${health}+${gain} ${type} (${amount}/${next})${mana}"), () => settings.skillTracker !== 0);

/**
 * Uses action bar to detect skill xp gains for non maxed out skills.
 */
registerWhen(register("actionBar", (health, gain, type, percent, mana) => {
    if (getPaused()) return;
    
    // Update info;
    current = type;
    const skill = skills[current];
    if (skill === undefined) return;

    // Update info
    percent = parseFloat(percent) / 100;
    skill.now = xpTable[skill.level + 1] - (xpTable[skill.level + 1] - xpTable[skill.level]) * (1 - percent);
    skill.since = 0;
}).setCriteria("${health}+${gain} ${type} (${percent}%)${mana}"), () => settings.skillTracker !== 0);

/**
 * Tracks skill level ups
 */
registerWhen(register("chat", (skill) => {
    skills[skill].level += 1;
}).setCriteria("  SKILL LEVEL UP ${skill} ${from}➜${to}"), () => settings.skillTracker !== 0);

/**
 * Updates skill tracker data every second.
 */
registerWhen(register("step", () => {
    if (getPaused() || current === "None") return;
    
    // Update tracker
    let skill = skills[current];
    if (skill === undefined) return;
    const rate = skill.getRate();

    if (skill.since < settings.skillTracker * 60) {
        skill.since += 1;
        skill.time += 1;
    }
    
    // Set HUD
    const timeDisplay = skill.since < settings.skillTracker * 60 ? getTime(skill.time) : `${RED}Inactive`;
    skillOverlay.message = 
`${DARK_AQUA + BOLD}Skill: ${WHITE + current}
${DARK_AQUA + BOLD}XP Gained: ${WHITE + commafy(skill.getGain())} xp
${DARK_AQUA + BOLD}Time Passed: ${WHITE + timeDisplay}
${DARK_AQUA + BOLD}Rate: ${WHITE + commafy(rate)} xp/hr
${DARK_AQUA + BOLD}Level Up: `;

    // Set time until next
    if (skill.level !== 60) {
        const neededXP = xpTable[skill.level + 1] - skill.now;
        skillOverlay.message += `${WHITE + getTime(neededXP / rate * 3600)}`;
    } else skillOverlay.message += `${GREEN}MAXED`;
}).setFps(1), () => settings.skillTracker !== 0);
