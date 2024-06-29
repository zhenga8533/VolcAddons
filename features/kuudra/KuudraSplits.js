import { AQUA, BOLD, DARK_GREEN, GOLD, GRAY, GREEN, LOGO, RED, RESET } from "../../utils/Constants";
import { data } from "../../utils/Data";
import location from "../../utils/Location";
import { Overlay } from "../../utils/Overlay";
import { registerWhen } from "../../utils/RegisterTils";
import Settings from "../../utils/Settings";
import { delay } from "../../utils/ThreadTils";
import { formatTime, isValidDate } from "../../utils/functions/format";
import { getPlayerName } from "../../utils/functions/player";
import { getKuudraHP } from "./KuudraDetect";

/**
 * Variables used to track and display Kuudra split overlay.
 */
let kuudraSplit = [0, 0, 0, 0, 0];
let times = ["0s", "0s", "0s", "0s"];
let phase = 0;
export function getPhase() {
  return phase;
}
let party = [];
const splitsExample = `${AQUA + BOLD}Supplies: ${RESET}Bei
${AQUA + BOLD}Build: ${RESET}Feng
${AQUA + BOLD}Fuel/Stun: ${RESET}Xiao
${AQUA + BOLD}Kuudra: ${RESET}Xiao`;
const splitsOverlay = new Overlay("kuudraSplits", data.SL, "moveSplits", splitsExample, ["Kuudra"]);

/**
 * Variables used to represent current date.
 */
const now = new Date();
const yyyy = now.getFullYear();
let mm = now.getMonth() + 1;
let dd = now.getDate();
if (dd < 10) dd = "0" + dd;
if (mm < 10) mm = "0" + mm;

/**
 * Resets Kuudra splits on run start.
 */
registerWhen(
  register("worldLoad", () => {
    kuudraSplit = [0, 0, 0, 0];
    times = ["0s", "0s", "0s", "0s"];
    phase = 0;
  }),
  () => Settings.kuudraSplits
);

/**
 * Tracks party on player ready.
 */
registerWhen(
  register("chat", (player) => {
    player = player.toLowerCase();
    if (!party.includes(player)) party.push(player);
  }).setCriteria("${player} is now ready!"),
  () => Settings.kuudraSplits
);

/**
 * First split.
 */
registerWhen(
  register("chat", () => {
    kuudraSplit[0] = Date.now() / 1000;
    phase = 1;
  }).setCriteria("[NPC] Elle: Okay adventurers, I will go and fish up Kuudra!"),
  () => location.getWorld() === "Kuudra"
);

/**
 * Second split.
 */
registerWhen(
  register("chat", () => {
    kuudraSplit[1] = Date.now() / 1000;
    phase = 2;
  }).setCriteria("[NPC] Elle: OMG! Great work collecting my supplies!"),
  () => location.getWorld() === "Kuudra"
);

/**
 * Third split.
 */
registerWhen(
  register("chat", () => {
    kuudraSplit[2] = Date.now() / 1000;
    phase = 3;
  }).setCriteria(
    "[NPC] Elle: Phew! The Ballista is finally ready! It should be strong enough to tank Kuudra's blows now!"
  ),
  () => location.getWorld() === "Kuudra"
);

/**
 * Fourth split.
 */
registerWhen(
  register("chat", () => {
    kuudraSplit[3] = Date.now() / 1000;
    phase = 4;
  }).setCriteria("[NPC] Elle: POW! SURELY THAT'S IT! I don't think he has any more in him!"),
  () => location.getWorld() === "Kuudra"
);

/**
 * Fifth (final) split.
 * Records split to a full and party data file.
 */
registerWhen(
  register("chat", () => {
    kuudraSplit[4] = Date.now() / 1000;
    phase = 5;
    if (!Settings.kuudraSplits) return;

    // Records last split and checks if no fucky wucky
    let broken = false;
    for (let i = 0; i < data.splits.last.length - 1; i++) {
      data.splits.last[i] = parseFloat(Math.abs(kuudraSplit[i + 1] - kuudraSplit[i]).toFixed(2));
      if (data.splits.last[i] > 69420 || data.splits.last[i] === 0) broken = true;
    }

    // Record Total
    data.splits.last[4] = parseFloat(
      (data.splits.last[0] + data.splits.last[1] + data.splits.last[2] + data.splits.last[3]).toFixed(2)
    );

    // Record splits
    let splitFormat = "";
    if (location.getTier() === 5) {
      // Check if new best split / run
      for (let i = 0; i < data.splits.last.length; i++) {
        if (!broken) splitFormat += `${data.splits.last[i]}, `;
        // Record best splits
        if (data.splits.last[i] < data.splits.best[i] && data.splits.last[i] !== 0)
          data.splits.best[i] = data.splits.last[i];
        // Record worst splits
        if (data.splits.last[i] > data.splits.worst[i] && data.splits.last[i] < 999)
          data.splits.worst[i] = data.splits.last[i];
      }
      // Tracks when timer not infinite
      if (!broken) {
        splitFormat = splitFormat + mm + "/" + dd + "/" + yyyy + "\n";
        FileLib.append("./VolcAddons/Data", "splits.txt", splitFormat);
        if (!data.files.includes("splits.txt")) data.files.push("splits.txt");

        // Tracks splits for unique parties
        const fileMembers = party.sort().join("-") + ".txt";
        if (party.length === 4) {
          FileLib.append("./VolcAddons/Data", fileMembers, splitFormat);
          if (!data.files.includes(fileMembers)) data.files.push(fileMembers);
        }
      }
    }

    // Resets party tracker
    party = [];
  }).setCriteria("${before}KUUDRA DOWN${after}"),
  () => location.getWorld() === "Kuudra"
);

/**
 * Fifth (final split) if you fail :skull:.
 */
registerWhen(
  register("chat", () => {
    kuudraSplit[4] = Date.now() / 1000;
    phase = 5;
  }).setCriteria("${before}DEFEAT${after}"),
  () => location.getWorld() === "Kuudra" && Settings.kuudraSplits
);

/**
 * Updates time splits overlay.
 */
registerWhen(
  register("step", () => {
    // Phase 4 fail safe
    if (phase === 3 && getKuudraHP() < 25000 && location.getTier() === 5) {
      kuudraSplit[3] = Date.now() / 1000;
      phase = 4;
    }
    if (phase === 4 && getKuudraHP() < 10) {
      kuudraSplit[4] = Date.now() / 1000;
      phase = 5;
    }

    switch (phase) {
      case 1:
        times[0] = formatTime(Date.now() / 1000 - kuudraSplit[0], 2);
        break;
      case 2:
        times[0] = formatTime(kuudraSplit[1] - kuudraSplit[0], 2);
        times[1] = formatTime(Date.now() / 1000 - kuudraSplit[1], 2);
        break;
      case 3:
        times[1] = formatTime(kuudraSplit[2] - kuudraSplit[1], 2);
        times[2] = formatTime(Date.now() / 1000 - kuudraSplit[2], 2);
        break;
      case 4:
        times[2] = formatTime(kuudraSplit[3] - kuudraSplit[2], 2);
        times[3] = formatTime(Date.now() / 1000 - kuudraSplit[3], 2);
        break;
      case 5:
        times[3] = formatTime(kuudraSplit[4] - kuudraSplit[3], 2);
        break;
    }

    // Draw Splits
    splitsOverlay.setMessage(
      `${AQUA + BOLD}Supplies: ${RESET + times[0]}
${AQUA + BOLD}Build: ${RESET + times[1]}
${AQUA + BOLD}Fuel/Stun: ${RESET + times[2]}
${AQUA + BOLD}Kuudra: ${RESET + times[3]}`
    );
  }).setFps(19),
  () => location.getWorld() === "Kuudra" && Settings.kuudraSplits
);

/**
 * Party commands for splits.
 */
let onCD = false;
registerWhen(
  register("chat", (player, message) => {
    const name = getPlayerName(player);
    if ((!Settings.partyCommands && !name.equals(Player.getName())) || onCD) return;

    const args = message.split(" ");
    switch (args[0]) {
      case "splits":
      case "split":
      case "last":
        last = [
          formatTime(data.splits.last[0], 2),
          formatTime(data.splits.last[1], 2),
          formatTime(data.splits.last[2], 2),
          formatTime(data.splits.last[3], 2),
          formatTime(data.splits.last[4], 2),
        ];
        delay(
          () =>
            ChatLib.command(
              `pc Supplies: ${last[0]} | Build: ${last[1]} | Fuel/Stun: ${last[2]} | Kuudra: ${last[3]} | Total: ${last[4]}`
            ),
          500
        );
        break;
      case "best":
        best = [
          formatTime(data.splits.best[0], 2),
          formatTime(data.splits.best[1], 2),
          formatTime(data.splits.best[2], 2),
          formatTime(data.splits.best[3], 2),
          formatTime(data.splits.best[4], 2),
        ];
        theory = formatTime(data.splits.best[0] + data.splits.best[1] + data.splits.best[2] + data.splits.best[3], 2);
        delay(
          () =>
            ChatLib.command(
              `pc Supplies: ${best[0]} | Build: ${best[1]} | Fuel/Stun: ${best[2]} | Kuudra: ${best[3]} | Total: ${best[4]} | Theoretical Best: ${theory}`
            ),
          500
        );
        break;
    }

    onCD = true;
    delay(() => (onCD = false), 500);
  }).setCriteria("Party > ${player}: ?${message}"),
  () => Settings.kuudraSplits
);

/**
 * Uses sound name and pitch to determine whenever Ragnarok Ability goes off.
 *
 * @param {Number[]} splits - Splits category and values.
 * @param {Color} color - Color code for message.
 * @param {Number} runs - Amount of runs to average.
 */
function formatSplits(splits, color, runs) {
  if (color === GREEN) ChatLib.chat(`${DARK_GREEN + BOLD}Average for last ${runs} runs:`);
  ChatLib.chat(
    `${color + BOLD}Supplies: ${RESET + formatTime(splits[0], 2)}
${color + BOLD}Build: ${RESET + formatTime(splits[1], 2)}
${color + BOLD}Fuel/Stun: ${RESET + formatTime(splits[2], 2)}
${color + BOLD}Kuudra: ${RESET + formatTime(splits[3], 2)}
${color + BOLD}Overall Run: ${RESET + formatTime(splits[4], 2)}`
  );
  if (color === GOLD) {
    const theory = (data.splits.best[0] + data.splits.best[1] + data.splits.best[2] + data.splits.best[3]).toFixed(2);
    ChatLib.chat(`${color + BOLD}Theoretical Best: ${RESET + formatTime(theory, 2)}`);
  }
  if (color === RED) {
    const conjecture = (
      data.splits.worst[0] +
      data.splits.worst[1] +
      data.splits.worst[2] +
      data.splits.worst[3]
    ).toFixed(2);
    ChatLib.chat(`${color + BOLD}Theoretical Worst: ${RESET + formatTime(conjecture, 2)}`);
  }
}

/**
 * /va command to fetch splits.
 *
 * @param {String[]} args - Array of player input values.
 */
export function getSplits(args) {
  switch (args[1]) {
    case "last":
      formatSplits(data.splits.last, AQUA, 0);
      return;
    case "best":
      formatSplits(data.splits.best, GOLD, 0);
      return;
    case "worst":
      formatSplits(data.splits.worst, RED, 0);
      return;
    case "today":
      const today = true;
    case "average":
      // Gets file name
      let fileName = "splits.txt";
      if (args[6] !== undefined)
        fileName =
          [args[3], args[4], args[5], args[6]]
            .map((p) => p.toLowerCase())
            .sort()
            .join("-") + ".txt";
      else if (args[5] !== undefined)
        fileName =
          [args[2], args[3], args[4], args[5]]
            .map((p) => p.toLowerCase())
            .sort()
            .join("-") + ".txt";

      const fileSplits = FileLib.read("./VolcAddons/Data", fileName);

      // Get runs from file
      if (fileSplits) {
        let runs = fileSplits.split("\n");
        runs.pop();

        // Filter by date
        if (isValidDate(args[2])) runs = runs.filter((run) => run.split(", ")[5] === args[2]);
        if (today || args[2] === "today")
          runs = runs.filter((run) => run.split(", ")[5] === mm + "/" + dd + "/" + yyyy);

        // Get # of runs to average
        let runsWanted = runs.length;
        if (!isNaN(args[2])) if (args[2] < runsWanted) runsWanted = args[2];

        // Average the runs
        let average = [0, 0, 0, 0, 0];
        let run = undefined;
        for (let i = runs.length - 1; i >= runs.length - runsWanted; i--) {
          run = runs[i].split(", ");
          if (run.length > 1) for (let j = 0; j < average.length; j++) average[j] += parseFloat(run[j]);
        }
        for (let i = 0; i < average.length; i++) average[i] = average[i] / runsWanted;

        formatSplits(average, GREEN, runsWanted);
      } else ChatLib.chat(`${RED}File [${fileName + RED}] not found!`);
      return;
    case "clear":
      // Clears every split
      data.files.forEach((file) => {
        FileLib.delete("./VolcAddons/Data", file);
      });
      data.files = [];

      ChatLib.chat(`${LOGO + GREEN}Succesfully cleared splits!`);
      return;
  }

  // Invalid command
  ChatLib.chat(`\n${LOGO + RED}Error: Invalid argument "${args[1]}"!`);
  ChatLib.chat(
    `${
      LOGO + RED
    }Please input as: ${WHITE}/va splits ${GRAY}<${WHITE}clear, last, best, today, average ${GRAY}<${WHITE}[# of runs], [player members], [mm/dd/yyyy]${GRAY}>>`
  );
}
