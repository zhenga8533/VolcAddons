import { CUBE_CLASS } from "../../utils/Constants";
import location from "../../utils/Location";
import { registerWhen } from "../../utils/RegisterTils";
import Settings from "../../utils/Settings";
import { setTitle } from "../../utils/Title";
import { formatNumber } from "../../utils/functions/format";

/**
 * Variables used to track and display Kuudra HP and entity.
 */
let cubes = undefined;
let percentHP = new Text(
  `One Cycleable`,
  Renderer.screen.getWidth() / 2 - Renderer.getStringWidth(`One Cycleable`) / 2,
  10
);
let HPDisplay = ["100k/100k ❤", 0, 0, 0];
let currentHP = 0;
export function getKuudraHP() {
  return currentHP;
}

/**
 * Tracks Kuudra's HP and spawn location if entering phase 4.
 */
registerWhen(
  register("tick", () => {
    cubes = World.getAllEntitiesOfType(CUBE_CLASS);

    // Find Kuudra based off size and HP
    const kuudra = cubes.find(
      (cube) => cube.getWidth().toFixed(1) == 15.3 && cube.getEntity().func_110143_aJ() <= 100_000
    );
    if (kuudra !== undefined) {
      currentHP = kuudra.getEntity().func_110143_aJ().toFixed(0);

      if (Settings.kuudraHP) {
        // Tesselator Display
        const color =
          currentHP > 99_000
            ? "§a"
            : currentHP > 75_000
            ? "§2"
            : currentHP > 50_000
            ? "§e"
            : currentHP > 25_000
            ? "§6"
            : currentHP > 10_000
            ? "§c"
            : "§4";
        HPDisplay = [`${color + formatNumber(currentHP)}§7/§a100k §c❤`, kuudra.getX(), kuudra.getY(), kuudra.getZ()];

        // Boss Health Bar Percentage
        const percent = `${((currentHP / 100_000) * 100).toFixed(2)}%`;
        percentHP = new Text(percent, Renderer.screen.getWidth() / 2 - Renderer.getStringWidth(percent) / 2, 10);
      }

      // KUUDRA SPAWN DETECT
      if (Settings.kuudraSpawn && location.getTier() === 5 && currentHP <= 25_000 && currentHP > 24_900) {
        x = kuudra.getX();
        z = kuudra.getZ();

        if (x < -128) setTitle("§c§lRIGHT!", "", 0, 25, 5, 81);
        else if (z > -84) setTitle("§2§lFRONT!", "", 0, 25, 5, 81);
        else if (x > -72) setTitle("§a§lLEFT!", "", 0, 25, 5, 81);
        else if (z < -132) setTitle("§4§lBACK!", "", 0, 25, 5, 81);
      }
    } else HPDisplay = ["100k/100k ❤", 0, 0, 0];
  }),
  () => location.getWorld() === "Kuudra" && (Settings.kuudraHP || Settings.kuudraSpawn)
);

/**
 * Renders Kuudra's percent HP.
 */
registerWhen(
  register("renderOverlay", () => {
    percentHP.draw();
  }),
  () => location.getWorld() === "Kuudra" && Settings.kuudraHP
);

/**
 * Draws Kuudra HP onto its physical body.
 */
registerWhen(
  register("renderWorld", () => {
    if (HPDisplay[1])
      Tessellator.drawString(HPDisplay[0], HPDisplay[1], HPDisplay[2] + 10, HPDisplay[3], 0xa7171a, true, 0.25, false);
  }),
  () => location.getWorld() === "Kuudra" && Settings.kuudraHP
);

/**
 * Reset Kuudra's UUID on world exit.
 */
register("worldUnload", () => {
  percentHP = new Text(
    `One Cycleable`,
    Renderer.screen.getWidth() / 2 - Renderer.getStringWidth(`One Cycleable`) / 2,
    10
  );
  HPDisplay = ["100k/100k ❤", 0, 0, 0];
});
