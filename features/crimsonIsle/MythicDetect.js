import { BLUE, BOLD, DARK_BLUE, DARK_RED, GOLEM_CLASS, GUARDIAN_CLASS, RED, WHITE } from "../../utils/Constants";
import { data } from "../../utils/Data";
import location from "../../utils/Location";
import { registerWhen } from "../../utils/RegisterTils";
import Settings from "../../utils/Settings";
import { setTitle } from "../../utils/Title";
import Waypoint from "../../utils/Waypoint";
import { announceMob } from "../../utils/functions/misc";

/**
 * Announce to party/all chat whenever player spawns a mythic lava creature.
 */
registerWhen(
  register("chat", () => {
    announceMob(Settings.mythicLavaAnnounce, "Lord Jawbus", Player.getX(), Player.getY(), Player.getZ());
  }).setCriteria("You have angered a legendary creature... Lord Jawbus has arrived."),
  () => location.getWorld() === "Crimson Isle" && Settings.mythicLavaAnnounce !== 0
);
registerWhen(
  register("chat", () => {
    announceMob(Settings.mythicLavaAnnounce, "Thunder", Player.getX(), Player.getY(), Player.getZ());
  }).setCriteria("You hear a massive rumble as Thunder emerges."),
  () => location.getWorld() === "Crimson Isle" && Settings.mythicLavaAnnounce !== 0
);

/**
 * Detects if any mythic lava creatures are near the player.
 */
const jaWaypoints = new Waypoint([0.55, 0, 0], 2, true, true, false);
const thunderWaypoints = new Waypoint([0, 0, 0.55], 2, true, true, false);

registerWhen(
  register("step", () => {
    jaWaypoints.clear();
    thunderWaypoints.clear();

    const thunders = World.getAllEntitiesOfType(GUARDIAN_CLASS).filter((guardian) =>
      guardian.getEntity().func_175461_cl()
    );
    if (thunders.length > 0) {
      // Check if Thunder is dead
      let foundDead = false;
      thunders.forEach((thunder) => {
        if (data.moblist.includes("jawbus")) thunderWaypoints.push([BLUE + "T1 Zeus", thunder]);
        if (thunder.getEntity().func_110143_aJ() === 0) foundDead = true;
      });

      // Update HUD
      if (foundDead) setTitle(`${DARK_BLUE + BOLD}THUNDER ${RED}DEAD!`, "", 0, 50, 10, 38);
      else setTitle(`${DARK_BLUE + BOLD}THUNDER ${WHITE}DETECTED!`, "", 0, 25, 5, 40);
    }

    const jawbussy = World.getAllEntitiesOfType(GOLEM_CLASS);
    if (jawbussy.length > 0) {
      // Check if Jawbus is dead
      let foundDead = false;
      jawbussy.forEach((jawbus) => {
        if (data.moblist.includes("jawbus")) jaWaypoints.push([DARK_RED + "Jawbussy", jawbus]);
        if (jawbus.getEntity().func_110143_aJ() === 0) foundDead = true;
      });

      // Update HUD
      if (foundDead) setTitle(`${DARK_RED + BOLD}JAWBUS ${RED}DEAD!`, "", 0, 50, 10, 39);
      else setTitle(`${DARK_RED + BOLD}JAWBUS ${WHITE}DETECTED!`, "", 0, 25, 5, 41);
    }
  }).setFps(2),
  () => location.getWorld() === "Crimson Isle" && Settings.mythicLavaDetect
);
