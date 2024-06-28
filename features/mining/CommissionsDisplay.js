import { BOLD, GOLD, GREEN, UNDERLINE, YELLOW } from "../../utils/Constants";
import { data } from "../../utils/Data";
import location from "../../utils/Location";
import { Overlay } from "../../utils/Overlay";
import { registerWhen } from "../../utils/RegisterTils";
import Settings from "../../utils/Settings";
import { setTitle } from "../../utils/Title";
import { getClosest } from "../../utils/functions/find";
import { isLookingAway } from "../../utils/functions/matrix";

const GEMSTONE_WAYPOINTS = {
  Citrine: [
    ["Citrine", 0xe4d00a, -51.5, 129.5, 410.5],
    ["Citrine", 0xe4d00a, -94.5, 146.5, 259.5],
    ["Citrine", 0xe4d00a, 38, 121.5, 387],
    ["Citrine", 0xe4d00a, -58, 146.5, 422],
  ],
  Aquamarine: [
    ["Aquamarine", 0x7fffd4, -1.5, 141.5, 437.5],
    ["Aquamarine", 0x7fffd4, 95.5, 155, 382.5],
    ["Aquamarine", 0x7fffd4, 51.5, 119.5, 302.5],
  ],
  Peridot: [
    ["Peridot", 0xb4c424, 91.5, 124.5, 397.5],
    ["Peridot", 0xb4c424, -76.5, 122.5, 281.5],
    ["Peridot", 0xb4c424, -62, 149.5, 300.5],
    ["Peridot", 0xb4c424, -73, 124.5, 458.5],
  ],
  Onyx: [
    ["Onyx", 0x000000, -68, 132.5, 407.5],
    ["Onyx", 0x000000, 79.5, 121.5, 411.5],
    ["Onyx", 0x000000, -6.5, 134.5, 386.5],
  ],
  Tungsten: [["Tungsten", 0x808080, 37.5, 155, 329.5]],
  Umber: [["Umber", 0x917668, 32.5, 124.5, 359.5]],
  Glacite: [["Glacite", 0xa5f2f3, 4.5, 134.5, 390.5]],
};
let commissionWaypoints = [];
let closestWaypoints = [];

const commissionExample = `§r§9§lCommissions:§r
§r §r§fUmber Collector: §r§c0%§r
§r §r§fCorpse Looter: §r§c0%§r
§r §r§fScrap Collector: §r§c0%§r
§r §r§fCitrine Gemstone Collector: §r§c0%§r`;
const commissionOverlay = new Overlay("commissionsDisplay", data.CDL, "moveCommissions", commissionExample, [
  "Crystal Hollows",
  "Dwarven Mines",
  "Mineshaft",
]);

registerWhen(
  register("renderWorld", () => {
    commissionWaypoints.forEach((gem) => {
      Tessellator.drawString(gem[0], gem[2], gem[3], gem[4], gem[1], true);
    });
  }),
  () => ["Crystal Hollows", "Dwarven Mines"].includes(location.getWorld()) && Settings.commissionWaypoints !== 0
);

registerWhen(
  register("step", () => {
    if (!World.isLoaded()) return;
    const tab = TabList.getNames();
    let index = tab.findIndex((name) => name === "§r§9§lCommissions:§r");
    if (index === -1) return;

    let commissionMessage = tab[index++];
    commissionWaypoints = [["Base Camp", 0xffd700, 0.5, 129, 200.5]];
    closestWaypoints = [];
    while (tab[index].startsWith("§r §r§f")) {
      // Set waypoints
      let parsed = tab[index].removeFormatting().trim().split(" ");
      let comm = parsed[0];
      if (comm in GEMSTONE_WAYPOINTS && parsed[1] !== "Walker") {
        let commWaypoints = GEMSTONE_WAYPOINTS[comm];
        let closest = getClosest([Player.getX(), Player.getY(), Player.getZ()], commWaypoints)[0];
        commissionWaypoints = commissionWaypoints.concat(commWaypoints.filter((wp) => wp != closest));

        // Change style for closest waypoint
        let closestCopy = [...closest];
        closestWaypoints.push(closestCopy);
        closestCopy[0] = `${BOLD + UNDERLINE}${closestCopy[0]}`;
        if (Settings.commissionWaypoints !== 2) commissionWaypoints.push(closestCopy);

        commissionMessage += `\n${tab[index].replace("§f", GOLD)}`;
      } else commissionMessage += `\n${tab[index]}`;

      // Set commission message
      index++;
    }

    commissionOverlay.setMessage(commissionMessage);
  }).setFps(4),
  () =>
    ["Crystal Hollows", "Dwarven Mines", "Mineshaft"].includes(location.getWorld()) &&
    (Settings.commissionsDisplay || Settings.commissionWaypoints !== 0)
);

/* Render closest lines */
const SKIP = new Set(["§l§nGlacite", "§l§nTungsten", "§l§nUmber"]);
registerWhen(
  register("renderWorld", (pt) => {
    const player = Player.asPlayerMP().getEntity();
    const x = player.field_70165_t * pt - player.field_70142_S * (pt - 1);
    const y = player.field_70163_u * pt - player.field_70137_T * (pt - 1) + Player.asPlayerMP().getEyeHeight();
    const z = player.field_70161_v * pt - player.field_70136_U * (pt - 1);

    closestWaypoints.forEach((close) => {
      if (isLookingAway(x, y, z, Player.getYaw(), close[2], close[3], close[4]) || SKIP.has(close[0])) return;

      GL11.glBlendFunc(770, 771);
      GL11.glEnable(GL11.GL_BLEND);
      GL11.glLineWidth(5);
      GL11.glDisable(GL11.GL_TEXTURE_2D);
      GL11.glDepthMask(true);
      GlStateManager.func_179094_E(); // pushMatrix()

      const hex = close[1];
      Tessellator.begin(3).colorize(((hex >> 16) & 0xff) / 255, ((hex >> 8) & 0xff) / 255, (hex & 0xff) / 255, 1);
      Tessellator.pos(x, y, z);
      Tessellator.pos(close[2], close[3], close[4]);
      Tessellator.draw();

      GlStateManager.func_179121_F(); // popMatrix()
      GL11.glEnable(GL11.GL_TEXTURE_2D);
      GL11.glDisable(GL11.GL_BLEND);
    });
  }),
  () =>
    location.getWorld() === "Dwarven Mines" &&
    (Settings.commissionWaypoints === 2 || Settings.commissionWaypoints === 3)
);

/**
 * Commission Complete Annoucne
 */
registerWhen(
  register("chat", (commission) => {
    setTitle(GREEN + BOLD + commission, `${YELLOW}Commission Complete!`, 5, 25, 5, 51);
  }).setCriteria("${commission} Commission Complete! Visit the King to claim your rewards!"),
  () => Settings.commissionAnnounce
);
