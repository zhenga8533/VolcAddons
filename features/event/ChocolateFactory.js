import { BOLD, GOLD, GRAY, GREEN, LIGHT_PURPLE, RED, WHITE, YELLOW } from "../../utils/Constants";
import { data } from "../../utils/Data";
import Location from "../../utils/Location";
import { Overlay } from "../../utils/Overlay";
import { registerWhen } from "../../utils/RegisterTils";
import Settings from "../../utils/Settings";
import { getSlotCoords } from "../../utils/functions/find";
import { formatNumber, formatTime, romanToNum, unformatNumber, unformatTime } from "../../utils/functions/format";

/**
 * Choco latte
 */
const updateChocolate = register("tick", () => {
  if (Player?.getContainer()?.getName() !== "Chocolate Factory") return;
  const items = Player.getContainer().getItems();
  const cf = data.cf;

  // Fetch the meaning of life
  const chocoData = items[13];
  if (chocoData) {
    cf.chocolate = parseInt(chocoData.getName().removeFormatting().replace(/\D/g, ""));
    cf.production = parseFloat(
      chocoData
        .getLore()
        .find((line) => line.endsWith("§8per second"))
        ?.removeFormatting()
        ?.replace(/,/g, "") ?? 0
    );
    cf.last = Math.floor(Date.now() / 1000);

    const allTime = chocoData
      .getLore()
      .find((line) => line.startsWith("§5§o§7All-time"))
      ?.removeFormatting()
      ?.split(" ");
    cf.all = parseFloat(allTime?.[2]?.removeFormatting()?.replace(/,/g, "") ?? 0);
  }

  // Fetch data related to prestiging
  const prestigeData =
    items[27]?.getUnlocalizedName() === "tile.thinStainedGlass" ? items[28]?.getLore() : items[27]?.getLore();
  if (prestigeData !== undefined) {
    const prestigeTotal = prestigeData
      .find((line) => line.startsWith("§5§o§7Chocolate this Prestige"))
      ?.removeFormatting()
      ?.split(" ");
    cf.total = parseFloat(prestigeTotal?.[prestigeTotal?.length - 1]?.replace(/,/g, "") ?? 0);

    const pestige = prestigeData
      .find((line) => line.startsWith("§5§o§7§cRequires"))
      ?.removeFormatting()
      ?.split(" ");
    cf.prestige = unformatNumber(pestige?.[1] ?? 0);
  }

  // Fetch eggs
  const eggData =
    items[35]?.getUnlocalizedName() === "tile.thinStainedGlass" ? items[34]?.getLore() : items[35]?.getLore();
  if (eggData !== undefined) {
    const eggs = data.eggs;
    const barnLine = eggData
      .find((line) => line.startsWith("§5§o§7Your Barn:"))
      ?.split(" ")?.[2]
      ?.removeFormatting()
      ?.split("/");
    eggs.total = parseInt(barnLine?.[0] ?? 0);
    eggs.max = parseInt(barnLine?.[1] ?? 20);
  }

  // Multiplier
  const productionData = items[45]?.getLore();
  if (productionData !== undefined) {
    const multiplier = productionData
      .find((line) => line.startsWith("§5§o§7Total Multiplier:"))
      ?.split(" ")?.[2]
      ?.removeFormatting();
    cf.multiplier = parseFloat(multiplier ?? 1);
  }

  // Time tower
  const towerData = items[39]?.getLore();
  if (towerData !== undefined) {
    const timeTower = data.timeTower;
    timeTower.bonus = romanToNum(items[39]?.getName()?.removeFormatting()?.split(" ")?.[2]) / 10;

    const charges = towerData.find((line) => line.startsWith("§5§o§7Charges:"));
    timeTower.charges = parseInt(charges?.split(" ")?.[1]?.removeFormatting()?.split("/")?.[0] ?? 0);

    const chargeTime = towerData.find((line) => line.startsWith("§5§o§7Next Charge:"));
    timeTower.chargeTime = unformatTime(chargeTime?.split(" ")?.[2]?.removeFormatting() ?? 28_800);

    const status = towerData
      .find((line) => line.startsWith("§5§o§7Status: §a§lACTIVE"))
      ?.split(" ")?.[2]
      ?.removeFormatting();
    timeTower.activeTime = status === undefined ? 0 : unformatTime(status);
  }
}).unregister();

/**
 * Chocolate overlay.
 */
const chocoExample = `§6§lChocolate:
 §eCurrent: §f12.72m
 §eProduction: §73.59k
 §eTotal: §f901.78m
 §eAll-time: §71.11b
 §ePrestige: §f1.00b

§6§lTime:
 §ePrestige: §77hr36m10s
 §eLast Open: §f2m27s

§6§lRabbits:
 §eTotal: §7101
 §eDupes: §f0`;
const chocoOverlay = new Overlay("chocoDisplay", data.CFL, "moveChoco", chocoExample);

registerWhen(
  register("step", () => {
    const cf = data.cf;
    const eggs = data.eggs;
    const now = Math.floor(Date.now() / 1000);
    const lastOpen = now - cf.last;

    // Time tower calc
    const towerData = data.timeTower;
    const timeLeft = towerData.activeTime - lastOpen;
    const noTower =
      (cf.production * (cf.multiplier - (towerData.activeTime > 0 ? towerData.bonus : 0))) / cf.multiplier;
    const production = timeLeft > 0 || towerData.activeTime <= 0 ? cf.production : noTower;

    const charges = parseInt(towerData.charges) + Math.max(0, Math.ceil((lastOpen - towerData.chargeTime) / 28_800));
    const towerStr =
      timeLeft > 0
        ? formatTime(timeLeft) + GREEN + " ✔"
        : charges > 0
        ? `${Math.min(3, charges)}/3`
        : formatTime(Math.abs(lastOpen - towerData.chargeTime)) + RED + " ✘";

    // Chocolate calc
    const boostedCalc = timeLeft > 0 ? (cf.production - noTower) * timeLeft : 0;
    const chocoCalc = production * lastOpen + boostedCalc;
    const chocoTotal = chocoCalc + cf.total;
    const chocoAll = chocoCalc + cf.all;
    const prestigeTime = (cf.prestige - chocoTotal) / noTower;

    chocoOverlay.setMessage(
      `${GOLD + BOLD}Chocolate:
 ${YELLOW}Current: ${WHITE + formatNumber(chocoCalc + cf.chocolate)}
 ${YELLOW}Production: ${GRAY + formatNumber(production)}
 ${YELLOW}Total: ${WHITE + formatNumber(chocoTotal)}
 ${YELLOW}All-time: ${GRAY + formatNumber(chocoAll)}
 ${YELLOW}Prestige: ${cf.prestige > 0 ? WHITE + formatNumber(cf.prestige) : GREEN + "✔"}

${GOLD + BOLD}Time:
 ${YELLOW}Prestige: ${GRAY + (prestigeTime > 0 ? formatTime(prestigeTime, 0, 3) : GREEN + "✔")}
 ${YELLOW}Tower: ${WHITE + towerStr}
 ${YELLOW}Last Open: ${GRAY + formatTime(lastOpen)}

${GOLD + BOLD}Rabbits:
 ${YELLOW}Total: ${WHITE + eggs.total}/${eggs.max}
 ${YELLOW}Dupes: ${GRAY + eggs.dupe}
 ${YELLOW}Completion: ${WHITE + (eggs.total / 4.57).toFixed(2)}%
 ${YELLOW}World: ${GRAY + Object.keys(data.eggs.found[Location.getWorld()] ?? {}).length}`
    );
  }).setFps(1),
  () => Settings.chocoDisplay
);

/**
 * Highlight best worker.
 */
const workerLevels = [0, 0, 0, 0, 0, 0, 0, 0, 0];
let bestWorker = 0;
let bestCost = 0;

function findWorker() {
  if (Player.getContainer().getName() !== "Chocolate Factory") return;
  bestWorker = 0;
  const cf = data.cf;
  const items = Player.getContainer().getItems();
  const baseMultiplier = cf.multiplier - data.timeTower.bonus;

  // Worker calc
  let maxValue = 0;
  for (let i = 28; i < 35; i++) {
    // Skip if not a worker
    let worker = items[i]?.getLore();
    if (worker === undefined) {
      Client.scheduleTask(1, findWorker);
      return;
    }

    // Get worker name
    let name = items[i].getName();
    let level = name.split(" ")[3]?.removeFormatting()?.replace(/\[|\]/g, "");
    workerLevels[i - 28] = name.substring(0, 2) + (isNaN(level) ? 0 : level);

    // Find cost
    let index = worker.findIndex((line) => line === "§5§o§7Cost");
    if (index === -1) continue;

    // Calculate value
    let cost = parseInt(worker[index + 1].removeFormatting().replace(/\D/g, ""));
    let value = ((i - 27) * baseMultiplier) / cost;

    if (value > maxValue) {
      bestWorker = i;
      maxValue = value;
      bestCost = cost;
    }
  }

  // Tower calc
  const tower = items[39].getLore();
  if (tower === undefined) {
    Client.scheduleTask(1, findWorker);
    return;
  }

  const towerI = tower.findIndex((line) => line === "§5§o§7Cost");
  if (Settings.rabbitHighlight === 1 && towerI !== -1) {
    const towerCost = parseInt(tower[towerI + 1].removeFormatting().replace(/\D/g, ""));
    const towerValue = ((cf.production / baseMultiplier) * 0.0125) / towerCost;

    if (towerValue > maxValue) {
      bestWorker = 39;
      maxValue = towerValue;
      bestCost = towerCost;
    }
  }
  workerLevels[7] = LIGHT_PURPLE + (romanToNum(items[39].getName().split(" ")[2]) ?? 0);

  // Jackrabbit calc
  const jackrabbit = items[42].getLore();
  if (jackrabbit === undefined) {
    Client.scheduleTask(1, findWorker);
    return;
  }

  const jackI = jackrabbit.findIndex((line) => line === "§5§o§7Cost");
  if (Settings.rabbitHighlight !== 3 && jackI !== -1) {
    const jackCost = parseInt(jackrabbit[jackI + 1].removeFormatting().replace(/\D/g, ""));
    const jackValue = ((cf.production / baseMultiplier) * 0.01) / jackCost;

    if (jackValue > maxValue) {
      bestWorker = 42;
      bestCost = jackCost;
    }
  }
  workerLevels[8] = LIGHT_PURPLE + (romanToNum(items[42].getName().split(" ")[2]) ?? 0);
}

const workerFind = register("chat", () => {
  Client.scheduleTask(1, () => {
    findWorker();
  });
})
  .setCriteria("Rabbit ${rabbit} has been promoted to ${rank}!")
  .unregister();

const coachFind = register("chat", () => {
  Client.scheduleTask(1, () => {
    findWorker();
  });
})
  .setCriteria("You upgraded to Coach Jackrabbit ${rank}!")
  .unregister();

const towerFind = register("chat", () => {
  Client.scheduleTask(1, () => {
    findWorker();
  });
})
  .setCriteria("You upgraded to Time Tower ${rank}!")
  .unregister();

const workerHighlight = register("guiRender", () => {
  if (bestWorker === 0) return;
  let [x, y] = getSlotCoords(bestWorker);

  Renderer.translate(0, 0, 100);
  Renderer.drawRect(data.cf.chocolate > bestCost ? Renderer.GREEN : Renderer.RED, x, y, 16, 16);

  // Draw worker levels
  Renderer.retainTransforms(true);
  Renderer.scale(0.9, 0.9);
  Renderer.translate(0, 0, 275);

  // Draw worker levels
  for (let i = 0; i < 7; i++) {
    [x, y] = getSlotCoords(28 + i);
    Renderer.drawString(workerLevels[i], (x * 10) / 9, ((y - 4) * 10) / 9, true);
  }

  // Draw tower levels
  Renderer.scale(10 / 9, 10 / 9);
  [x, y] = getSlotCoords(39);
  Renderer.drawString(workerLevels[7], x + 22 - Renderer.getStringWidth(workerLevels[7]), y + 12, true);
  [x, y] = getSlotCoords(42);
  Renderer.drawString(workerLevels[8], x + 22 - Renderer.getStringWidth(workerLevels[8]), y + 12, true);

  Renderer.retainTransforms(false);
}).unregister();

/**
 * /cf controls.
 */
const chocomatte = register("guiClosed", () => {
  chocomatte.unregister();
  updateChocolate.unregister();
  coachFind.unregister();
  towerFind.unregister();
  workerFind.unregister();
  workerHighlight.unregister();
}).unregister();

registerWhen(
  register("guiOpened", () => {
    Client.scheduleTask(2, () => {
      if (Player.getContainer().getName() !== "Chocolate Factory") return;

      updateChocolate.register();
      if (Settings.rabbitHighlight) {
        findWorker();
        coachFind.register();
        towerFind.register();
        workerFind.register();
        workerHighlight.register();
        chocomatte.register();
      }
    });
  }),
  () => Settings.rabbitHighlight !== 0 || Settings.chocoDisplay
);
