import RenderLib from "../../../RenderLib";
import {
  AQUA,
  BOLD,
  DARK_GRAY,
  DARK_GREEN,
  DARK_RED,
  GOLD,
  GRAY,
  GREEN,
  RED,
  RESET,
  YELLOW,
} from "../../utils/Constants";
import { data } from "../../utils/Data";
import location from "../../utils/Location";
import { Overlay } from "../../utils/Overlay";
import { registerWhen } from "../../utils/RegisterTils";
import Settings from "../../utils/Settings";
import { setTitle } from "../../utils/Title";
import { getSlotCoords } from "../../utils/functions/find";
import { formatTime, removeNonNumeric } from "../../utils/functions/format";

const sprays = {};
let pests = [];

/**
 * Uses pests widget in TabList in order to track all plots with pests.
 */
function setPests() {
  pests = [];
  if (!World.isLoaded()) return;

  const pestLine = TabList.getNames().find((tab) => tab.startsWith("§r Plots:"));
  if (pestLine === undefined) return;

  pests = pestLine.removeFormatting().trim().split(", ");
  if (pests.length > 0) pests[0] = pests[0].split(" ")[1];
}
registerWhen(register("step", setPests).setFps(1), () => location.getWorld() === "Garden");

/**
 * Command to teleport to plot with pests.
 */
register("command", () => {
  setPests();
  if (pests.length === 0) {
    setTitle(`${DARK_RED}Pests Controlled!`, "No plots have any pests!", 10, 50, 10, 70);
    return;
  }

  const zone = removeNonNumeric(
    Scoreboard.getLines()
      .find((line) => line.getName().startsWith("   §aPlot §7-"))
      ?.getName()
      ?.removeFormatting()
      ?.trim()
      ?.split(" ")?.[2]
  );
  const plot = pests.find((plot) => plot !== zone);

  if (plot !== undefined) {
    setTitle(`${DARK_GREEN}Warping...`, `Teleporting to plot ${plot}!`, 10, 50, 10, 70);
    ChatLib.command(`plottp ${plot}`);
  } else setTitle(`${DARK_RED}Please Remain Seated.`, "You are in the only plot with pests!", 10, 50, 10, 70);
}).setName("pesttp");

/**
 * Alerts for pest spawns
 */
registerWhen(
  register("chat", (_, plot) => {
    setTitle(`${GREEN}Plot ${GRAY}- ${AQUA + plot}`, `${GOLD}1 ${RED}Pest ${GRAY}has spawned...`, 10, 50, 10, 71);
  }).setCriteria("${ew}! A Pest has appeared in Plot - ${plot}!"),
  () => location.getWorld() === "Garden" && Settings.pestAlert
);
registerWhen(
  register("chat", (_, num, plot) => {
    setTitle(
      `${GREEN}Plot ${GRAY}- ${AQUA + plot}`,
      `${GOLD + num} ${RED}Pests ${GRAY}have spawned...`,
      10,
      50,
      10,
      71
    );
  }).setCriteria("${ew}! ${num} Pests have spawned in Plot - ${plot}!"),
  () => location.getWorld() === "Garden" && Settings.pestAlert
);

/**
 * Pest swarm
 */
registerWhen(
  register("step", () => {
    const count = parseInt(
      TabList.getNames()
        .find((name) => name.startsWith("§r Alive:"))
        ?.split(" ")?.[2]
        ?.removeFormatting() ?? 0
    );
    if (count < Settings.infestationAlert) return;
    setTitle(
      `${DARK_GREEN + BOLD}SPREADING PLAGUE`,
      `${count} minions with ${BOLD}Taunt ${RESET}are in the way!`,
      0,
      25,
      5,
      69
    );
  })
    .setFps(1)
    .unregister(),
  () => Settings.infestationAlert !== 0 && location.getWorld() === "Garden"
);

/**
 * Desk highlighting for pests and sprays
 */
const render = register("guiRender", () => {
  const items = Player.getContainer().getItems();
  Object.keys(highlights).forEach((index) => {
    const [x, y] = getSlotCoords(index);

    Renderer.translate(0, 0, 100);
    Renderer.drawRect(highlights[index][0], x, y, 16, 16);
    items[index].setStackSize(highlights[index][1]);
  });
}).unregister();

const close = register("guiClosed", () => {
  render.unregister();
  close.unregister();
}).unregister();

registerWhen(
  register("guiOpened", () => {
    Client.scheduleTask(3, () => {
      if (Player.getContainer().getName() !== "Configure Plots") return;

      highlights = {};
      const items = Player.getContainer().getItems();
      for (let i = 0; i < 5; i++) {
        for (let j = 2; j < 7; j++) {
          let index = i * 9 + j;
          let lore = items[index].getLore();

          const pestLine = lore.find((line) => line.startsWith("§5§o§4§lൠ"))?.split(" ");
          const sprayLine = lore.find((line) => line.startsWith("§5§o§7Sprayed"));

          if (sprayLine !== undefined) {
            const splitSpray = sprayLine.split(" ");
            highlights[index] = [
              Renderer.color(57, 255, 20, 128),
              splitSpray[splitSpray.length - 2].removeFormatting().replace(/\D/g, ""),
            ];

            // Get time left on spray
            let time = sprayLine.removeFormatting().match(/(?: (\d+)m)? (\d+)s/);
            let minutes = time[1] ? parseInt(time[1], 10) : 0;
            let seconds = parseInt(time[2], 10);

            // Set time left on spray (backup)
            sprays[
              items[index]
                .getName()
                .removeFormatting()
                .replace(/[^0-9]/g, "")
            ] = minutes * 60 + parseInt(seconds);
          }
          if (pestLine !== undefined)
            highlights[index] = [Renderer.color(139, 0, 0, 255), pestLine[pestLine.length - 2].removeFormatting()];
        }
      }

      if (Settings.deskHighlight) {
        render.register();
        close.register();
      }
    });
  }),
  () => location.getWorld() === "Garden"
);

/**
 * Spray display.
 */
const sprayExample = `${GREEN + BOLD}Sprays:
 ${AQUA}Plot 0 ${DARK_GRAY}(${GREEN}1m10s${DARK_GRAY})
 ${AQUA}Plot 0 ${DARK_GRAY}(${GREEN}1m01s${DARK_GRAY})`;
const sprayOverlay = new Overlay("sprayDisplay", data.SDL, "moveSpray", sprayExample, ["Garden"]);

registerWhen(
  register("step", () => {
    setPests();
    let sprayMessage = `${GREEN + BOLD}Sprays:`;

    const keys = Object.keys(sprays);
    keys.forEach((plot) => {
      if (--sprays[plot] <= 0) {
        setTitle(`${RED + BOLD}SPRAY EXPIRED: ${GREEN}Plot ${plot + RED}!`, "", 10, 50, 10, 72);
        delete sprays[plot];
      }

      const time = sprays[plot];
      const sprayColor = time > 1200 ? GREEN : time > 600 ? YELLOW : RED;
      sprayMessage += `\n ${AQUA}Plot ${plot + DARK_GRAY} (${sprayColor + formatTime(time) + DARK_GRAY})`;
    });
    if (keys.length === 0) sprayMessage += `\n ${RED}None...`;
    sprayOverlay.setMessage(sprayMessage);
  }).setFps(1),
  () => location.getWorld() === "Garden"
);

registerWhen(
  register("chat", (plot) => {
    sprays[plot] = 1_800;
  }).setCriteria("SPRAYONATOR! You sprayed Plot - ${plot} with Plant Matter!"),
  () => location.getWorld() === "Garden"
);

/**
 * Pesthunter bonus tracking.
 */
const bonuses = {};
let remain = 0;
function addPests(pest) {
  if (pest in bonuses) addPests(pest.toString() + String.fromCharCode(Math.floor(Math.random() * 26) + 97));
  else bonuses[pest] = 1800;
}
registerWhen(
  register("chat", (_, fortune) => {
    remain = 1800;
    addPests(fortune);
  }).setCriteria("[NPC] Phillip: In exchange for ${pests} Pests, I've given you +${fortune}☘ Farming Fortune for 30m!"),
  () => location.getWorld() === "Garden" && Settings.pesthunterBonus
);

/**
 * Track bonus timer
 */
const bonusExample = `${YELLOW + BOLD}Pest Bonus: ${GREEN}T1 FIGHTING`;
const bonusOverlay = new Overlay("pesthunterBonus", data.PHL, "moveBonus", bonusExample, ["Garden"]);

registerWhen(
  register("step", () => {
    let bonusMessage = `${YELLOW + BOLD}Pest Bonus: `;
    let fortune = 0;
    Object.keys(bonuses).forEach((bonus) => {
      if (fortune === 0) time = bonuses[bonus];
      if (--bonuses[bonus] === 0) delete bonuses[bonus];
      else fortune += parseInt(bonus.replace(/[^0-9]/g, ""));
    });

    if (fortune === 0) bonusMessage += `${RED + BOLD}Inactive!`;
    else {
      const bonusColor = remain > 1200 ? GREEN : remain > 600 ? YELLOW : RED;
      bonusMessage += `${GOLD + fortune}☘ ${bonusColor}(${formattime(--remain)})`;
    }

    bonusOverlay.setMessage(bonusMessage);
  }).setFps(1),
  () => location.getWorld() === "Garden" && Settings.pesthunterBonus
);

/**
 * Garden box rendering.
 */
registerWhen(
  register("renderWorld", () => {
    const plotLine = Scoreboard.getLines().find((line) => line.getName().startsWith("   §aPlot"));
    const zone =
      plotLine
        ?.getName()
        ?.removeFormatting()
        ?.trim()
        ?.split(" ")?.[2]
        ?.replace(/[^0-9]/g, "") ?? "0";
    const x = Math.floor((Player.getX() + 240) / 96);
    const z = Math.floor((Player.getZ() + 240) / 96);
    let color = [1, 1, 1];

    if (pests.includes(zone)) {
      const plotName = plotLine.getName();
      Tessellator.drawString(
        DARK_RED + plotName.substring(plotName.length - 1) + " Pests",
        x * 96 - 192,
        77,
        z * 96 - 192,
        0,
        true,
        0.5,
        false
      );
      color = [1, 0, 0];
    } else if (sprays.hasOwnProperty(zone)) {
      Tessellator.drawString(GREEN + formatTime(sprays[zone]), x * 96 - 192, 77, z * 96 - 192, 0, true, 0.5, false);
      color = [0, 1, 0];
    }

    RenderLib.drawEspBox(-192 + x * 96, 67, -192 + z * 96, 96, 10, ...color, 1, true);
  }),
  () => location.getWorld() === "Garden" && Settings.gardenBox
);
