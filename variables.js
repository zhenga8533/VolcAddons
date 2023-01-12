import PogObject from "../PogData"

export let data = new PogObject("Moditee", {
    "whitelist": [],
    "inParty": false,
    "isLeader": false,
    "vanqWarp": {
        "vanqCoords": [0, 0, 0, "N/A"],
        "vanqSpawned": false,
        "notInParty": 0
    },
    "kuudraRP": {
        "waitingOnJoin": false,
        "needToReparty": false
    }
}, "datitee.json")

// TRACK PARTY
register("chat", () => { // Tracks party join
    data.inParty = true;
    data.isLeader = false;
    data.save();
}).setCriteria("You have joined ${player} party!")

register("chat", () => { // Tracks /stream open x
    data.inParty = true;
    data.isLeader = true;
    data.save();
}).setCriteria("Party is capped at ${cap} players.")

register("chat", () => { // Tracks /p disband
    data.inParty = false;
    data.save();
}).setCriteria("${player} has disbanded the party!")

register("chat", () => { // Tracks empty party
    data.inParty = false;
    data.save();
}).setCriteria("The party was disbanded because all invites expired and the party was empty.")

register("chat", () => { // Tracks /p leave
    data.inParty = false;
    data.save();
}).setCriteria("You left the party.")

// TRACK PARTY LEADER
register("chat", (rank, name) => { // Tracks /p list (control)
    if (Player.getName().equals(name)) data.isLeader = true;
    else data.isLeader = false;
    data.save();
}).setCriteria("Party Leader: ${rank} ${name} ●")

register("chat", (rank1, name1, rank2, name2) => { // Tracks transfers
    if (Player.getName().equals(name1)) data.isLeader = true;
    else data.isLeader = false;
    data.save();
}).setCriteria("The party was transferred to ${rank1} ${name1} by ${rank2} ${name2}")

register("chat", (rank1, name1, rank2, name2) => { // Tracks transfers by leave
    if (Player.getName().equals(name1)) data.isLeader = true;
    else data.isLeader = false;
    data.save();
}).setCriteria("The party was transferred to ${rank1} ${name1} because ${rank2} ${name2} left")

register("chat", (rank1, name1, rank2, name2) => { // Tracks first invite
    if (Player.getName().equals(name1) && !data.inParty) data.isLeader = true;
    data.inParty = true;
    data.save();
}).setCriteria("${rank1} ${name1} invited ${rank2} ${name2} to the party! They have 60 seconds to accept.")