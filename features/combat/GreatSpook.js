import axios from "../../../axios";
import settings from "../../utils/settings";
import { BOLD, GREEN, LOGO, RED, WHITE } from "../../utils/constants";
import { data, registerWhen } from "../../utils/variables";
import { Overlay } from "../../utils/overlay";
import { getTime } from "../../utils/functions";


/**
 * Primal Fear Timer
 */
const fearExample = `${RED + BOLD}Next Fear: ${WHITE}WHO DO WE CALL?`;
const fearTimer = new Overlay("fearTimer", ["all"], () => true, data.PFL, "moveFear", fearExample);
let time = 0;

registerWhen(register("step", () => {
    fearTimer.message = `${RED + BOLD}Next Fear: ${WHITE}${--time > 0 ? getTime(time) : "GHOST BUSTERS"}`;
}).setFps(1), () => settings.fearTimer);

registerWhen(register("chat", () => {
    time = 240;
}).setCriteria("FEAR. A Primal Fear has been summoned!"), () => settings.fearTimer);

/**
 * Use eval to solve math teacher equation
 */
registerWhen(register("chat", (equation, event) => {
    ChatLib.chat(`${LOGO}&r&d&lQUICK MATHS! &r&7Solve: &r&e${equation + WHITE} = ${GREEN + eval(equation.replace(/[x]/g, '*'))}&r`);
    cancel(event);
}).setCriteria("QUICK MATHS! Solve: ${equation}"), () => settings.mathSolver);

/**
 * Use SkyCrypt to know # of primal fear kills
 */
export function getFear() {
    axios.get(`https://sky.shiiyu.moe/api/v2/profile/${Player.getName()}`).then(res => {
        const kills = res.data.profiles[data.lastID]?.raw?.stats?.kills_primal_fear;
        ChatLib.chat(`${LOGO + RED + BOLD}Total Primal Fear Kills: ${WHITE + kills}`);
    });
}
