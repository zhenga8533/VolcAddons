import settings from "../settings";
import { DARK_AQUA, RED } from "../utils/constants";
import { WHITE } from "../utils/constants";
import { BOLD, GRAY } from "../utils/constants";
import { commafy, getTime } from "../utils/functions";
import { Overlay } from "../utils/overlay";
import { data } from "../utils/variables";

// Skill Tracking
class Skill {
    constructor() {
        this.reset();
    }
    reset() {
        this.start = 0.00; // Starting xp
        this.now = 0.00; // Current xp
        this.gain = 0.00; // Starting - Current xp
        this.next = 0; // xp for level up
        this.time = 0.00 // Time passed
        this.rate = 0.00; // xp/hr
        this.since = 600; // Time since last xp earn
    }
}

let skills = {
    "None": new Skill(),
    "Farming": new Skill(),
    "Mining": new Skill(),
    "Combat": new Skill(),
    "Foraging": new Skill(),
    "Fishing": new Skill(),
    "Enchanting": new Skill(),
    "Alchemy": new Skill(),
}
let current = "None";

register("command", () => {
    for (let key in skills)
        skills[key].reset()
}).setName("resetSkills");

// HUD
const skillExample = [
`${DARK_AQUA}${BOLD}Skill: ${WHITE}FEE
${DARK_AQUA}${BOLD}Gain: ${WHITE}FI
${DARK_AQUA}${BOLD}Time Passed: ${WHITE}FO
${DARK_AQUA}${BOLD}Rate: ${WHITE}FUM`
];
const skillOverlay = new Overlay("trackSkills", ["all"], data.AL, "moveSkills", skillExample);

register("actionBar", (before, msg, after) => {
    if (!settings.trackSkills) return;

    // Update info
    const data = msg.replace('/', ' ').split(' ');
    current = data[1]
    const skill = skills[current];
    const amount = data[2].replace(/\D/g,'');

    // Reset skill tracking
    if (skill.start == 0)
        skill.start = amount - data[0];
    
    // Calc skill gain
    skill.now = amount;
    skill.gain = amount - skill.start;
    if (skill.gain < 0) // If skill level up
        skill.start = skill.next - skill.start;

    // Finish updating info
    skill.next = data[3];
    skill.since = 0;
}).setCriteria("${before}+${msg})${after}")

register("step", () => {
    if (!settings.trackSkills) return;
    
    let skill = skills[current];

    if (skill.since < settings.trackSkills * 60) {
        skill.since += 1;
        skill.time += 1;
        skill.rate = skill.gain / skill.time * 3600;
    }
    
    // Set HUD
    const timeDisplay = skills[current].since < settings.trackSkills * 60 ? getTime(skills[current].time) : `${RED}Inactive`;
    skillOverlay.message = 
`${DARK_AQUA}${BOLD}Skill: ${WHITE}${current}
${DARK_AQUA}${BOLD}Gain: ${WHITE}${commafy(skills[current].gain)} xp
${DARK_AQUA}${BOLD}Time Passed: ${WHITE}${timeDisplay}
${DARK_AQUA}${BOLD}Rate: ${WHITE}${commafy(skills[current].rate)} xp/hr`;
}).setDelay(1);
