import { AQUA, DARK_GRAY, GRAY, LOGO, RED, WHITE, WITHER_CLASS, YELLOW } from "../../utils/constants";
import { formatTime } from "../../utils/functions/format";
import location from "../../utils/location";
import { registerWhen } from "../../utils/register";
import socket from "../../utils/socket";


/**
 * Track off of wither names.
 */
const trackEvent = register("step", () => {
    const withers = World.getAllEntitiesOfType(WITHER_CLASS);
    withers.forEach(wither => {
        ChatLib.chat(wither.getName());
    });
}).setFps(1).unregister();

function trackEvent() {
    trackEvent.unregister();
    trackEvent.register();
}

register("worldLoad", () => {
    ChatLib.chat(location.getWorld());
})

/**
 * Track the event start message.
 */
register("chat", (event) => {
    const loc = location.getWorld();
    const world = loc === "Dwarven Mines" ? "dm" :
        loc === "Crystal Hollows" ? "ch" : undefined;
    if (world === undefined) return;

    socket.send({
        "command": world,
        "request": "post",
        "event": event
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
    const loc = command === "ch" ? "Crystal Hollows" : 
        command === "dm" ? "Dwarven Mines" : RED + "???";
    
    ChatLib.chat(`${LOGO + YELLOW + loc} Events:`)
    Object.keys(events).forEach(event => {
        const time = events[event].time;
        const percerntage = events[event].percentage;

        ChatLib.chat(`${DARK_GRAY}- ${AQUA + event + WHITE} ${formatTime(time) + GRAY} (${percerntage}%)`);
    })
}

register("command", () => {
    socket.send({
        "command": "ch",
        "request": "get",
        "event": "event"
    });
}).setName("chevent");

register("command", () => {
    socket.send({
        "command": "dm",
        "request": "get",
        "event": "event"
    });
}).setName("dmevent");


/**
 * Alloy tracking.
 */
registerWhen(register("chat", (username) => {
    socket.send({
        "command": "alloy",
        "request": "post",
        "username": username
    });
}).setCriteria("ALLOY! ${username} just found a Divan's Alloy!"), () => location.getWorld() === "Crystal Hollows");

register("command", () => {
    socket.send({
        "command": "alloy",
        "request": "get"
    });
}).setName("alloy");

export function processAlloy(data) {
    const last_alloy = data.last_alloy;
    const date = new Date(Date.now() - last_alloy * 1_000);
    ChatLib.chat(`${LOGO + YELLOW}Alloy: ${WHITE + formatTime(last_alloy)} ago ${DARK_GRAY}(${date.toLocaleDateString()})`);
}
