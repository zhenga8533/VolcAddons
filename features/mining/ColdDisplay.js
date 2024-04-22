import { AQUA, BOLD, GOLD } from "../../utils/constants";
import { Overlay } from "../../utils/overlay";
import { data } from "../../utils/variables";


const coldExample = 
`§b§lCold Debuffs:
 -34.5% §6⸕
 -50% ✦`;
const coldOverlay = new Overlay("coldDisplay", ["Dwarven Mines"], () => true, data.COL, "moveCold", coldExample);

register("step", () => {
    if (!World.isLoaded()) return;
    coldOverlay.message = "";

    const coldLine = Scoreboard.getLines().find(line => line.getName().startsWith("Cold:"));
    if (coldLine === undefined) return;
    const cold = parseInt(coldLine.getName().replace(/\D/g, ''));
    const msDebuff = (cold * 0.5).toFixed(1);

    coldOverlay.message = `${AQUA + BOLD}Cold Debuffs:\n`;
    coldOverlay.message += ` -${msDebuff}% ${GOLD}⸕\n`;
    coldOverlay.message += cold >= 75 ? " -75% ✦" :
        cold >= 50 ? " -50% ✦" :
        cold >= 25 ? " -25% ✦" : "";
    print(coldOverlay.message);
}).setFps(1);
