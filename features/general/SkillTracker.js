import settings from "../../settings";
import { BOLD, DARK_AQUA, RED, WHITE } from "../../utils/constants";
import { commafy, getTime } from "../../utils/functions";
import { Overlay } from "../../utils/overlay";
import { Stat, data, getPaused, registerWhen } from "../../utils/variables";


/**
 * Variables to track and display skill tracker overlay.
 */
const skills = {
    "None": new Stat(),
    "Farming": new Stat(),
    "Mining": new Stat(),
    "Combat": new Stat(),
    "Foraging": new Stat(),
    "Fishing": new Stat(),
    "Enchanting": new Stat(),
    "Alchemy": new Stat(),
}
let current = "None";
const skillExample =
`${DARK_AQUA}${BOLD}Skill: ${WHITE}FEE
${DARK_AQUA}${BOLD}XP Gained: ${WHITE}FI
${DARK_AQUA}${BOLD}Time Passed: ${WHITE}FO
${DARK_AQUA}${BOLD}Rate: ${WHITE}FUM`;
const skillOverlay = new Overlay("skillTracker", ["all"], data.AL, "moveSkills", skillExample);

/**
 * Resets skill overlay to base state.
 */
register("command", () => {
    for (let key in skills)
        skills[key].reset()
}).setName("resetSkills");

/**
 * Uses action bar to detect skill xp gains to use to update skill object data.
 *
 * @param {string} before - Use beginning of message.
 * @param {string} gain - Amount of xp gained.
 * @param {string} type - Type of skill xp gained.
 * @param {string} amount - Current amount of skill xp.
 * @param {string} next - Skill xp needed to level up (0 at max).
 * @param {string} after - Useless ending of message.
 */
registerWhen(register("actionBar", (before, gain, type, amount, next, after) => {
    if (getPaused()) return;

    // Update info
    amount = parseInt(amount.replace(/,/g, ''));
    current = type;
    const skill = skills[current];
    if (skill === undefined) return;
    
    // Reset skill tracking
    if (skill.start == 0)
        skill.start = amount - parseInt(gain.replace(/,/g, ''));
    
    // Calc skill gain
    skill.now = amount;
    skill.gain = amount - skill.start;
    if (skill.gain < 0) // If skill level up
        skill.start = skill.next - skill.start;

    // Finish updating info
    skill.next = parseInt(next);
    skill.since = 0;
}).setCriteria("${before}+${gain} ${type} (${amount}/${next})${after}"), () => settings.skillTracker);

/**
 * Updates skill tracker data every second.
 */
registerWhen(register("step", () => {
    if (getPaused()) return;
    
    let skill = skills[current];
    if (skill === undefined) return;

    if (skill.since < settings.skillTracker * 60) {
        skill.since += 1;
        skill.time += 1;
        skill.rate = skill.gain / skill.time * 3600;
    }
    
    // Set HUD
    const timeDisplay = skills[current].since < settings.skillTracker * 60 ? getTime(skills[current].time) : `${RED}Inactive`;
    skillOverlay.message = 
`${DARK_AQUA}${BOLD}Skill: ${WHITE}${current}
${DARK_AQUA}${BOLD}XP Gained: ${WHITE}${commafy(skills[current].gain)} xp
${DARK_AQUA}${BOLD}Time Passed: ${WHITE}${timeDisplay}
${DARK_AQUA}${BOLD}Rate: ${WHITE}${commafy(skills[current].rate)} xp/hr`;
}).setFps(1), () => settings.skillTracker);
