import settings from "../../settings"
import { getInParty, getWorld, registerWhen } from "../../utils/variables"

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
    setTimeout(function () { if (getInParty()) ChatLib.command("p leave") }, 500);

    let timeout = 500
    setTimeout(function () {
        settings.vanqParty.split(", ").forEach(ign => {
            notInParty++;
            setTimeout(function () { ChatLib.command(`p ${ign}`); }, timeout);
            timeout += 500;
        })
    }, 500);
}).setCriteria("A Vanquisher is spawning nearby!"), () => getWorld() == "crimson isle" && settings.vanqParty);

function warpParty() {
    if (!vanqSpawned) return;

    notInParty--;

    if (notInParty <= 0 && getInParty()) {
        vanqSpawned = false;
        notInParty = 0;

        setTimeout(function () { ChatLib.command('p warp'); }, 500); 
        setTimeout(function () { ChatLib.command(`pc x: ${vanqCoords[0]}, y: ${vanqCoords[1]}, z: ${vanqCoords[2]} | Vanquisher Spawned at [${vanqCoords[3]} ]!`); }, 1000);
        setTimeout(function () { ChatLib.command("p disband"); }, 1500);
    }
}

// Checks if all players are in lobby
registerWhen(register("chat", () => {
    setTimeout(warpParty(), 500);
}).setCriteria("${player} joined the party."), () => getWorld() == "crimson isle" && settings.vanqParty);

// If player doesnt accept
registerWhen(register("chat", () => {
    setTimeout(warpParty(), 500);
}).setCriteria("The party invite to ${player} has expired"), () => getWorld() == "crimson isle" && settings.vanqParty);

// Safety net
registerWhen(register("chat", () => {
    vanqSpawned = false;
    notInParty = 0;
}).setCriteria("You have joined ${player} party!"), () => getWorld() == "crimson isle" && settings.vanqParty);

registerWhen(register("chat", () => {
    vanqSpawned = false;
    notInParty = 0;
}).setCriteria("RARE DROP! Nether Star"), () => getWorld() == "crimson isle" && settings.vanqParty);

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
    setTimeout(noInvite(), 500);
}).setCriteria("Couldn't find a player with that name!"), () => getWorld() == "crimson isle" && settings.vanqParty);

registerWhen(register("chat", () => {
    setTimeout(noInvite(), 500);
}).setCriteria("You cannot invite that player since they're not online."), () => getWorld() == "crimson isle" && settings.vanqParty);
