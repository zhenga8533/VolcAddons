import { BOLD, GOLD, GREEN, LOGO, PLAYER_CLASS, RED, RESET, WHITE } from "../../utils/Constants";
import { data } from "../../utils/Data";
import location from "../../utils/Location";
import mayor from "../../utils/Mayor";
import { Overlay } from "../../utils/Overlay";
import { registerWhen } from "../../utils/RegisterTils";
import Settings from "../../utils/Settings";
import { setTitle } from "../../utils/Title";
import Waypoint from "../../utils/Waypoint";
import { announceMob } from "../../utils/functions/misc";

/**
 * Variables used to track and display Inquisitor counter.
 */
const session = {
  inqs: 0,
  burrows: 0,
  last: 0,
  average: 0,
};
const counterExample = `${GOLD + BOLD}Total Inqs: ${RESET}Who.
${GOLD + BOLD}Total Burrows: ${RESET}Let.
${GOLD + BOLD}Burrows Since: ${RESET}Him.
${GOLD + BOLD}Average Burrows: ${RESET}Cook.`;
const counterOverlay = new Overlay("inqCounter", data.IL, "moveInq", counterExample, ["Hub"]);

/**
 * Updates the inquisitor counter depending on if an inquisitor spawned.
 *
 * @param {Boolean} inqSpawned - True if inquisitor spawned, false otherwise.
 */
export function updateInqCounter(inqSpawned) {
  // Overall
  data.inqSession.burrows++;
  data.inqSession.last++;
  if (inqSpawned) {
    data.inqSession.inqs++;
    data.inqSession.last = 0;
  }
  if (data.inqSession.inqs) data.inqSession.average = Math.round(data.inqSession.burrows / data.inqSession.inqs);

  // Session
  session.burrows++;
  session.last++;
  if (inqSpawned) {
    session.inqs++;
    session.last = 0;
  }
  if (session.inqs) session.average = Math.round(session.burrows / session.inqs);

  // Update HUD
  if (mayor.getPerks().has("Mythological Ritual"))
    counterOverlay.setMessage(
      Settings.inqCounter === 1
        ? `${GOLD + BOLD}Total Inqs: ${RESET + data.inqSession.inqs}
${GOLD + BOLD}Total Burrows: ${RESET + data.inqSession.burrows}
${GOLD + BOLD}Burrows Since: ${RESET + data.inqSession.last}
${GOLD + BOLD}Average Burrows: ${RESET + data.inqSession.average}`
        : `${GOLD + BOLD}Total Inqs: ${RESET + session.inqs}
${GOLD + BOLD}Total Burrows: ${RESET + session.burrows}
${GOLD + BOLD}Burrows Since: ${RESET + session.last}
${GOLD + BOLD}Average Burrows: ${RESET + session.average}`
    );
}

/**
 * Command to reset the stats for the overall counter.
 */
register("command", () => {
  data.inqSession = {
    inqs: 0,
    burrows: 0,
    last: 0,
    average: 0,
  };
  if (mayor.getPerks().has("Mythological Ritual")) counterOverlay.setMessage(counterExample);
  ChatLib.chat(`${LOGO + GREEN}Succesfully reset Inquisitor tracker!`);
}).setName("resetInq");

/**
 * Announce inquisitor spawn on chat message appears.
 */
registerWhen(
  register("chat", (_, mob) => {
    if (mob === "Minos Inquisitor") {
      announceMob(Settings.inqAlert, "Minos Inquisitor", Player.getX(), Player.getY(), Player.getZ());
      if (Settings.inqCounter !== 0) updateInqCounter(true);
    } else if (Settings.inqCounter !== 0) updateInqCounter(false);
  }).setCriteria("${wow}! You dug out a ${mob}!"),
  () => location.getWorld() === "Hub" && mayor.getPerks().has("Mythological Ritual")
);

/**
 * Tracks world for any inquisitors near player.
 */
const inqWaypoints = new Waypoint([1, 0.84, 0], 2, true, true, false);
registerWhen(
  register("step", () => {
    inqWaypoints.clear();
    const inquisitors = World.getAllEntitiesOfType(PLAYER_CLASS).filter(
      (player) => player.getName() === "Minos Inquisitor"
    );

    if (inquisitors.length > 0) {
      // Check if inquisitor is dead
      let foundDead = false;
      inquisitors.forEach((inq) => {
        if (data.moblist.includes("inquisitor")) inqWaypoints.push([GOLD + "Inquisitor", inq]);
        if (inq.getEntity().func_110143_aJ() === 0) foundDead = true;
      });

      // Update HUD
      if (foundDead) setTitle(`${GOLD + BOLD}INQUISITOR ${RED}DEAD!`, "", 0, 50, 10, 59);
      else setTitle(`${GOLD + BOLD}INQUISITOR ${WHITE}DETECTED!`, "", 0, 25, 5, 60);
    }
  }).setFps(2),
  () => location.getWorld() === "Hub" && Settings.detectInq && mayor.getPerks().has("Mythological Ritual")
);
