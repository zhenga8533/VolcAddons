import { data, setRegisters } from "./variables";

// World
register("chat", (data) => {
    // Example Object: {"server":"mini37CE","gametype":"SKYBLOCK","mode":"crimson_isle","map":"Crimson Isle"}
    try {
        data = JSON.parse(`{${data}}`);
        if (data.gametype != "SKYBLOCK") return;

        setWorld(data.mode);
    } catch (err) {
        print(err);
    }
}).setCriteria("{${data}}")

function setWorld(world) {
    // Check for Kuudra (shows as instanced)
    if (world == "instanced") {
        worldLine = Scoreboard.getLines().find((line) => line.getName().includes("⏣"));
        worldLine = worldLine == undefined ? "None" : worldLine.getName().removeFormatting().replace(/\W/g, '');

        if (worldLine.includes("Kuudra")) {
            world = "kuudra"
            data.tier = parseInt(worldLine.slice(-1));
        }
    } else data.tier = 0;

    data.world = world;
    setRegisters();
}


// Zone (NOT IN USE)
/*register("step", () => {
    zone = Scoreboard.getLines().find((line) => line.getName().includes("⏣"));
    zone = zone == undefined ? "none" : zone.getName().removeFormatting().replace(/[^\w\s!?]/g,'').trim();
}).setDelay(1);*/
