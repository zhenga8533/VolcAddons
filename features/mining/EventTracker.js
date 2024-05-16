import { GRAY, LOGO } from "../../utils/constants";
import { formatTime } from "../../utils/functions/format";
import location from "../../utils/location";
import socket from "../../utils/socket";


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

export function processEvent(data) {
    const command = data.command;
    const events = data.events;
    
    Object.keys(events).forEach(event => {
        const time = events[event].time;
        const percerntage = events[event].percentage;

        ChatLib.chat(`${LOGO + GRAY + formatTime(time)} (${percerntage})`);
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
