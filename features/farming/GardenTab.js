import { AQUA, BOLD, GREEN, RED, WHITE } from "../../utils/Constants";
import { data } from "../../utils/Data";
import location from "../../utils/Location";
import { Overlay } from "../../utils/Overlay";
import { registerWhen } from "../../utils/RegisterTils";
import Settings from "../../utils/Settings";
import { formatTime } from "../../utils/functions/format";

/**
 * Variables used to represent and display visitors.
 */
const gardenExample = `${AQUA + BOLD}Visitors ${WHITE}(5):
${GREEN + BOLD} Never
${GREEN + BOLD} Gonna
${GREEN + BOLD} Give
${GREEN + BOLD} You
${GREEN + BOLD} Up`;
const gardenOverlay = new Overlay("gardenTab", data.VL, "moveVisitors", gardenExample);
let nextVisitor = 0;
let visitorCount = 5;
let visitors = [
  `${AQUA + BOLD}Visitors: ${WHITE}(5)`,
  ` ${RED}???`,
  ` ${RED}???`,
  ` ${RED}???`,
  ` ${RED}???`,
  ` ${RED}???`,
];

/**
 * Fetches the visitor data in tablist and updates the Visitors Overlay every second.
 */
registerWhen(
  register("step", () => {
    if (!World.isLoaded()) return;

    const tablist = TabList.getNames();
    gardenOverlay.setMessage("");
    let gardenMessage = "";
    let visitorIndex = tablist.findIndex((tab) => tab.startsWith("§r§b§lVisitors:"));
    if (visitorIndex === -1) return;

    // Get all visitors
    visitorCount = parseInt(tablist[visitorIndex].split(" ")[1].substring(5, 6));
    visitors = [];
    for (let i = 0; i <= visitorCount; i++) {
      let visitor = tablist[visitorIndex + i];
      if (visitor.length > 34) visitor = visitor.split(" ").splice(0, 3).join(" ");
      gardenMessage += visitor + "\n";
      visitors.push(visitor);
    }

    // Get next visitor timing
    let tabTime = 0;
    const visitorTime = tablist[visitorIndex + visitorCount + 1]
      .removeFormatting()
      .replace(/[^0-9ms\s]/g, "")
      .trim()
      .split(" ");
    if (visitorTime.length === 3)
      tabTime = 60 * visitorTime[1].replace("m", "") + parseInt(visitorTime[2].replace("s", ""));
    else if (visitorTime.length === 2) {
      if (visitorTime[1].endsWith("m")) tabTime = 60 * visitorTime[1].replace("m", "");
      else tabTime = parseInt(visitorTime[1].replace("s", ""));
    }

    // Update next display
    if ((tabTime !== 0 && tabTime < nextVisitor - 60) || tabTime > nextVisitor + 60 || nextVisitor === 0)
      nextVisitor = tabTime;
    if (nextVisitor > 0) gardenMessage += ` Next Visitor: ${AQUA + formatTime(nextVisitor)}`;
    else gardenMessage += ` Next Visitor: ${RED + BOLD}Queue Full!`;

    gardenOverlay.setMessage(gardenMessage);
  }).setFps(1),
  () => location.getWorld() === "Garden" && Settings.gardenTab
);

/**
 * Next Visitor stuff
 */
registerWhen(
  register("step", () => {
    // Decrement visitor timer
    nextVisitor--;
    if (location.getWorld() === "Garden") return;

    // Update visitor display outside Garden
    if (nextVisitor <= 0 && visitorCount < 5) {
      visitorCount++;
      visitors[0] = `${AQUA + BOLD}Visitors: ${WHITE}(${visitorCount})`;
      visitors.push(` ${RED}???`);
      nextVisitor = 720;
    }

    let gardenMessage = "";
    visitors.forEach((visitor) => {
      gardenMessage += visitor + "\n";
    });
    if (nextVisitor > 0) gardenMessage += ` Next Visitor: ${AQUA + formatTime(nextVisitor)}`;
    else gardenMessage += ` Next Visitor: ${RED + BOLD}Queue Full!`;
    gardenOverlay.setMessage(gardenMessage);
  }).setFps(1),
  () => Settings.gardenTab
);

// Set next visitor time (assuming with 20% visitor reduction)
registerWhen(
  register("chat", () => {
    nextVisitor = 720;
  }).setCriteria("${npc} has arrived on your Garden!"),
  () => Settings.gardenTab
);
