import settings from "../../settings";
import { BOLD, DARK_AQUA, RED, WHITE } from "../../utils/constants";
import { commafy, getTime } from "../../utils/functions";
import { Overlay } from "../../utils/overlay";
import { Stat, data, getPaused, registerWhen } from "../../utils/variables";

// Skill Tracking
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

register("command", () => {
    for (let key in skills)
        skills[key].reset()
}).setName("resetSkills");

// HUD
const skillExample =
`${DARK_AQUA}${BOLD}Skill: ${WHITE}FEE
${DARK_AQUA}${BOLD}XP Gained: ${WHITE}FI
${DARK_AQUA}${BOLD}Time Passed: ${WHITE}FO
${DARK_AQUA}${BOLD}Rate: ${WHITE}FUM`;
const skillOverlay = new Overlay("skillTracker", ["all"], data.AL, "moveSkills", skillExample);


// Track skill gain
registerWhen(register("actionBar", (before, msg, after) => {
    if (getPaused()) return;

    // Update info
    const data = msg.replace('/', ' ').split(' ');
    current = data[1];
    const skill = skills[current];
    const amount = data[2].replace(/\D/g,'');

    // Fail safe
    if (skill == undefined) return;
    
    // Reset skill tracking
    if (skill.start == 0)
        skill.start = amount - data[0].replace(/,/g, '');
    
    // Calc skill gain
    skill.now = amount;
    skill.gain = amount - skill.start;
    if (skill.gain < 0) // If skill level up
        skill.start = skill.next - skill.start;

    // Finish updating info
    skill.next = data[3];
    skill.since = 0;
}).setCriteria("${before}+${msg})${after}"), () => settings.skillTracker);

registerWhen(register("step", () => {
    if (getPaused()) return;
    
    let skill = skills[current];
    if (skill == undefined) return;

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
