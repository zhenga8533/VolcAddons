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
