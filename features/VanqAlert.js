import settings from "../settings"
import {data} from "../variables"

// PARTY COMMANDS
register("chat", () => {
    if (settings.vanqAlert && data.inParty && settings.vanqParty.equals("")) {
        // PLAYER POSITION
        const x = Math.round(Player.getX())
        const y = Math.round(Player.getY())
        const z = Math.round(Player.getZ())
    
        // AREA PLAYER IS IN
        let area = "N/A"
        Scoreboard.getLines().forEach(item => {
            if (item.getName().includes("⏣")) {
                area = item.getName().removeFormatting();
                return;
            }
        });

        if (settings.vanqAlertAll) ChatLib.command(`ac x: ${x}, y: ${y}, z: ${z} | Vanquisher Spawned at [${area} ]!`);
        else ChatLib.command(`pc x: ${x}, y: ${y}, z: ${z} | Vanquisher Spawned at [${area} ]!`)
    }
}).setCriteria("A Vanquisher is spawning nearby!");