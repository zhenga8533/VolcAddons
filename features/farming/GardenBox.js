import RenderLib from "../../../RenderLib/index.js";
import settings from "../../utils/settings.js";
import { registerWhen } from "../../utils/variables.js";


/**
 * Draw bounding box on current plot.
 */
registerWhen(register("renderWorld", () => {
    const x = Math.floor((Player.getX() + 240) / 96);
    const z = Math.floor((Player.getZ() + 240) / 96);

    RenderLib.drawEspBox(-192 + x * 96, 67, -192 + z * 96, 96, 10, 1, 1, 1, 1, true);
}), () => settings.gardenBox);
