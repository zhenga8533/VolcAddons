import settings from "../../settings";
import { getInParty } from "../../utils/party";
import { delay } from "../../utils/thread";
import { data, registerWhen } from "../../utils/variables";

let vanqCoords = [0, 0, 0, "None"];
let vanqSpawned = false;
let notInParty = 0;

registerWhen(register("chat", () => {
    if (vanqSpawned) return;

    vanqSpawned = true;
    notInParty = 0;

    // PLAYER POSITION
    vanqCoords[0] = Math.round(Player.getX())
    vanqCoords[1] = Math.round(Player.getY())
    vanqCoords[2] = Math.round(Player.getZ())
    
    // AREA PLAYER IS IN
    let area = "N/A"
    Scoreboard.getLines().forEach(item => {
        if (item.getName().includes("⏣")) {
            vanqCoords[3] = item.getName().removeFormatting();
            return;
        }
    });

    // INVITE PARTY
    delay(() => { if (getInParty()) ChatLib.command("p leave") }, 500);

    let timeout = 1000
    settings.vanqParty.split(", ").forEach(ign => {
        delay(() => { ChatLib.command(`p ${ign}`) }, timeout);
        notInParty++;
        timeout += 500;
    });
}).setCriteria("A Vanquisher is spawning nearby!"), () => data.world == "crimson_isle" && settings.vanqParty);

function warpParty() {
    if (!vanqSpawned) return;

    notInParty--;
    if (notInParty <= 0 && getInParty()) {
        vanqSpawned = false;
        notInParty = 0;

        delay(() => { ChatLib.command('p warp') }, 500);
        delay(() => { ChatLib.command(`pc x: ${vanqCoords[0]}, y: ${vanqCoords[1]}, z: ${vanqCoords[2]} | Vanquisher Spawned at [${vanqCoords[3]} ]!`) }, 1000);
        delay(() => { ChatLib.command("p disband") }, 1500);
    }
}

// Checks if all players are in lobby
registerWhen(register("chat", () => {
    delay(warpParty(), 500);
}).setCriteria("${player} joined the party."), () => data.world == "crimson_isle" && settings.vanqParty);

// If player doesnt accept
registerWhen(register("chat", () => {
    delay(warpParty(), 500);
}).setCriteria("The party invite to ${player} has expired"), () => data.world == "crimson_isle" && settings.vanqParty);

// Safety net
registerWhen(register("chat", () => {
    vanqSpawned = false;
    notInParty = 0;
}).setCriteria("You have joined ${player} party!"), () => data.world == "crimson_isle" && settings.vanqParty);

registerWhen(register("chat", () => {
    vanqSpawned = false;
    notInParty = 0;
}).setCriteria("RARE DROP! Nether Star"), () => data.world == "crimson_isle" && settings.vanqParty);

function noInvite() {
    if (!vanqSpawned) return;

    notInParty--;
    if (notInParty <= 0) {
        notInParty = 0;
        vanqSpawned = false;
    }
}

// Make sure players exists / are online
registerWhen(register("chat", () => {
    delay(noInvite(), 500);
}).setCriteria("Couldn't find a player with that name!"), () => data.world == "crimson_isle" && settings.vanqParty);

registerWhen(register("chat", () => {
    delay(noInvite(), 500);
}).setCriteria("You cannot invite that player since they're not online."), () => data.world == "crimson_isle" && settings.vanqParty);
