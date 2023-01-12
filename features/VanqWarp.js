import settings from "../settings"
import {data} from "../variables"

register("chat", () => {
    if (settings.vanqParty.length > 0 && !data.vanqWarp.vanqSpawned) {
        data.vanqWarp.vanqSpawned = true;
        data.vanqWarp.notInParty = 0;

        // PLAYER POSITION
        data.vanqWarp.vanqCoords[0] = Math.round(Player.getX())
        data.vanqWarp.vanqCoords[1] = Math.round(Player.getY())
        data.vanqWarp.vanqCoords[2] = Math.round(Player.getZ())
    
        // AREA PLAYER IS IN
        let area = "N/A"
        Scoreboard.getLines().forEach(item => {
            if (item.getName().includes("⏣")) {
                data.vanqWarp.vanqCoords[3] = item.getName().removeFormatting();
                return;
            }
        });

        // INVITE PARTY
        setTimeout(function () { if (data.inParty) ChatLib.command("p leave") }, 250);

        let timeout = 250
        setTimeout(function () {
            settings.vanqParty.split(", ").forEach(ign => {
                data.vanqWarp.notInParty++;
                setTimeout(function () { ChatLib.command(`p ${ign}`); }, timeout);
                timeout += 250;
            })
        }, 500);

        data.save()
    }
}).setCriteria("A Vanquisher is spawning nearby!");


register("chat", () => {
    setTimeout(() => {
        if (data.vanqWarp.vanqSpawned) {
            data.vanqWarp.notInParty--;
            data.save();

            if (data.vanqWarp.notInParty <= 0) {
                data.vanqWarp.vanqSpawned = false;
                data.vanqWarp.notInParty = 0;

                const x = data.vanqWarp.vanqCoords[0];
                const y = data.vanqWarp.vanqCoords[1];
                const z = data.vanqWarp.vanqCoords[2];
                const area = data.vanqWarp.vanqCoords[3];

                setTimeout(function () { ChatLib.command('p warp'); }, 500);
                setTimeout(function () { ChatLib.command(`pc x: ${x}, y: ${y}, z: ${z} | Vanquisher Spawned at [${area} ]!`); }, 1000);
                setTimeout(function () { ChatLib.command("p disband"); }, 1500);
            }

            data.save();
        }
    }, 500);
}).setCriteria("${rank} ${name} joined the party.");

// Make sure players exists / are online
register("chat", () => {
    if (data.vanqWarp.vanqSpawned) {
        data.vanqWarp.notInParty--;
        if (data.vanqWarp.notInParty <= 0) {
            data.vanqWarp.notInParty = 0;
            data.vanqWarp.vanqSpawned = false;
        }
        data.save();
    }
}).setCriteria("Couldn't find a player with that name!");

register("chat", () => {
    if (data.vanqWarp.vanqSpawned) {
        data.vanqWarp.notInParty--;
        if (data.vanqWarp.notInParty <= 0) {
            data.vanqWarp.notInParty = 0;
            data.vanqWarp.vanqSpawned = false;
        }
        data.save();
    }
}).setCriteria("You cannot invite that player since they're not online.");
