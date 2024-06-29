import { AMOGUS, BOLD, GREEN, LOGO, RED, WHITE } from "../../utils/Constants";
import { registerWhen } from "../../utils/RegisterTils";
import Settings from "../../utils/Settings";
import { setTitle } from "../../utils/Title";
import { playSound } from "../../utils/functions/misc";

/**
 * Primal Fear Tracker
 */
registerWhen(
  register("step", () => {
    if (!World.isLoaded()) return;

    if (TabList.getNames().find((name) => name === "§r §r§cPrimal Fears§r§7: §r§61s§r") !== undefined) {
      setTitle(`${RED + BOLD}FEAR UP`, "", 10, 50, 10, 20);
      playSound(AMOGUS, 10000);
    }
  }).setFps(2),
  () => Settings.fearAlert
);

/**
 * Use eval to solve math teacher equation
 */
registerWhen(
  register("chat", (equation, event) => {
    ChatLib.chat(
      `${LOGO}&r&d&lQUICK MATHS! &r&7Solve: &r&e${equation + WHITE} = ${GREEN + eval(equation.replace(/[x]/g, "*"))}&r`
    );
    cancel(event);
  }).setCriteria("QUICK MATHS! Solve: ${equation}"),
  () => Settings.mathSolver
);
