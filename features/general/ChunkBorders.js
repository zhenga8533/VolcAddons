import RenderLib from "../../../RenderLib/index";
import { data } from "../../utils/Data";

/**
 * Draw bounding box on current plot.
 */
let rendering = false;
const renderBorders = register("renderWorld", () => {
  const x = Math.floor(Player.getX() / 16);
  const z = Math.floor(Player.getZ() / 16);

  RenderLib.drawEspBox(x * 16 + 8, 0, z * 16 + 8, 16, 256, 1, 1, 0, 1, false);
  RenderLib.drawInnerEspBox(x * 16 + 8, 0, z * 16 + 8, 16, 256, 1, 1, 0, 0.2, false);
}).unregister();

const chunkey = new KeyBind("Chunk Border", data.chunkey, "./VolcAddons.xdd");
register("gameUnload", () => {
  data.chunkey = chunkey.getKeyCode();
});
chunkey
  .registerKeyPress(() => {
    if (rendering) renderBorders.unregister();
    else renderBorders.register();
    rendering = !rendering;
  })
  .setPriority(Priority.HIGHEST);
