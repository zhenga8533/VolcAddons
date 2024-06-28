import { BOLD, CHEST_CLASS, DARK_AQUA, WHITE } from "../../utils/Constants";
import { data } from "../../utils/Data";
import location from "../../utils/Location";
import { Overlay } from "../../utils/Overlay";
import { registerWhen } from "../../utils/RegisterTils";
import Settings from "../../utils/Settings";
import Waypoint from "../../utils/Waypoint";

/**
 * Variables used to track and detect nearby chests.
 */
const chests = new Waypoint([1, 0, 1], 1); // Purple Powder Chests
const powderExample = `${DARK_AQUA + BOLD}Nearby Chests: ${WHITE}dentge.`;
const powderOverlay = new Overlay("powderChest", data.HL, "moveChest", powderExample, ["Crystal Hollows"]);

/**
 * Detects nearby chests to create waypoints and update overlay.
 */
registerWhen(
  register("tick", () => {
    chests.clear();
    World.getAllTileEntitiesOfType(CHEST_CLASS)
      .filter(
        (chest) =>
          chest.tileEntity.field_145987_o === 0 &&
          Player.asPlayerMP().distanceTo(chest.getBlockPos()) <= Settings.powderChest
      )
      .forEach((chest) => chests.push([chest.getX() + 1, chest.getY(), chest.getZ() + 1]));
    powderOverlay.setMessage(`${DARK_AQUA + BOLD}Nearby Chests: ${WHITE + chests.getWaypoints().length}`);
  }),
  () => location.getWorld() === "Crystal Hollows" && Settings.powderChest !== 0
);

/**
 * Remove powder chest spam.
 */
registerWhen(
  register("chat", (gain, event) => {
    if (Settings.powderHider === 3) cancel(event);
    else if (Settings.powderHider === 1 && !gain.includes("Powder")) cancel(event);
    else if (Settings.powderHider === 2 && gain.includes("Powder")) cancel(event);
  }).setCriteria("You received ${gain}"),
  () => Settings.powderHider !== 0
);
