import { AQUA, DARK_GRAY, GRAY, LOGO, RED, WHITE, WITHER_CLASS, YELLOW } from "../../utils/Constants";
import location from "../../utils/Location";
import { registerWhen } from "../../utils/RegisterTils";
import Socket from "../../utils/Socket";
import { delay } from "../../utils/ThreadTils";
import { formatTime } from "../../utils/functions/format";

/**
 * Track off of wither names.
 */
const findEvent = register("step", () => {
  const loc = location.getWorld();
  const world = loc === "Dwarven Mines" ? "dm" : loc === "Crystal Hollows" ? "ch" : undefined;
  if (world === undefined) {
    findEvent.unregister();
    return;
  }

  World.getAllEntitiesOfType(WITHER_CLASS).forEach((wither) => {
    const name = wither.getName().toLowerCase().removeFormatting();
    let match = name.match(/(passive event|event) (.+) (running for|active in (.+)) (\d+):(\d+)/);

    if (match) {
      const n = match.length;
      const event = match[2];
      const time = parseInt(match[n - 2]) * 60 + parseInt(match[n - 1]) + (name.startsWith("passive") ? 300 : 600);

      // Capitalize the first and last word.
      const words = event.split(" ");
      words[0] = words[0][0].toUpperCase() + words[0].slice(1);
      words[words.length - 1] = words[words.length - 1][0].toUpperCase() + words[words.length - 1].slice(1);

      // Send the event data to the server.
      Socket.send({
        command: world,
        request: "post",
        event: words.join(" "),
        time: time,
      });
      findEvent.unregister();
    }
  });
})
  .setFps(1)
  .unregister();

/**
 * Track the event in the Dwarven Mines and Crystal Hollows.
 *
 * @param {Number} attempt - The number of attempts to track the event.
 */
function trackEvent(attempt = 0) {
  if (attempt > 5) return;

  const world = location.getWorld();
  if (world === undefined) delay(() => trackEvent(attempt + 1), 1000);
  else if (world === "Dwarven Mines" || world === "Crystal Hollows") findEvent.register();
  else findEvent.unregister();
}
register("worldLoad", trackEvent);

/**
 * Track the event start message.
 */
register("chat", (event) => {
  const loc = location.getWorld();
  const world = loc === "Dwarven Mines" ? "dm" : loc === "Crystal Hollows" ? "ch" : undefined;
  if (world === undefined) return;

  Socket.send({
    command: world,
    request: "post",
    event: event,
  });
}).setCriteria(" ⚑ The ${event} event starts in 20 seconds${_}");

/**
 * Process the event data received from the server.
 *
 * @param {Object} data - The data received from the server.
 */
export function processEvent(data) {
  const command = data.command;
  const events = data.events;
  const loc = command === "ch" ? "Crystal Hollows" : command === "dm" ? "Dwarven Mines" : RED + "???";

  ChatLib.chat(`${LOGO + YELLOW + loc} Events:`);
  Object.keys(events).forEach((event) => {
    const time = events[event].time;
    const percentage = parseFloat(events[event].percentage).toFixed(2);

    ChatLib.chat(`${DARK_GRAY}- ${AQUA + event + WHITE} ${formatTime(time) + GRAY} (${percentage}%)`);
  });
}

register("command", () => {
  Socket.send({
    command: "ch",
    request: "get",
    event: "event",
  });
}).setName("chevent");

register("command", () => {
  Socket.send({
    command: "dm",
    request: "get",
    event: "event",
  });
}).setName("dmevent");

/**
 * Alloy tracking.
 */
registerWhen(
  register("chat", (username) => {
    Socket.send({
      command: "alloy",
      request: "post",
      username: username,
    });
  }).setCriteria("ALLOY! ${username} just found a Divan's Alloy!"),
  () => location.getWorld() === "Crystal Hollows"
);

register("command", () => {
  Socket.send({
    command: "alloy",
    request: "get",
  });
}).setName("alloy");

export function processAlloy(data) {
  const last_alloy = data.last_alloy;
  const date = new Date(Date.now() - last_alloy * 1_000);
  ChatLib.chat(
    `${LOGO + YELLOW}Alloy: ${WHITE + formatTime(last_alloy)} ago ${DARK_GRAY}(${date.toLocaleDateString()})`
  );
}
