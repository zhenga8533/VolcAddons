import { AQUA, BOLD, DARK_GREEN, GOLD, GREEN, ITALIC, LOGO, RED, RESET } from "../utils/constants";
import { getTime, isValidDate, renderScale } from "../utils/functions";
import settings from "../settings";
import { data, getPlayerName, getWorld } from "../utils/variables";
import { Overlay } from "../utils/overlay";

// Start times for each phase
let kuudraSplit = [0, 0, 0, 0, 0];
let times = ['0s', '0s', '0s', '0s'];
let phase = 0;
let party = [];

// Date
const now = new Date();
const yyyy = now.getFullYear();
let mm = now.getMonth() + 1;
let dd = now.getDate();
if (dd < 10) dd = '0' + dd;
if (mm < 10) mm = '0' + mm;

// OVERLAY
const splitsExample =
`${AQUA}${BOLD}Supplies: ${RESET}Bei
${AQUA}${BOLD}Build: ${RESET}Feng
${AQUA}${BOLD}Fuel/Stun: ${RESET}Xiao
${AQUA}${BOLD}Kuudra: ${RESET}Xiao`;

const splitsOverlay = new Overlay("kuudraSplits", ["kuudra t5", "kuudra f4"], data.SL, "moveSplits", splitsExample);

register("tick", () => {
    switch (phase) {
        case 1:
            times[0] = getTime(Date.now() / 1000 - kuudraSplit[0]);
            break;
        case 2:
            times[0] = getTime(kuudraSplit[1] - kuudraSplit[0]);
            times[1] = getTime(Date.now() / 1000 - kuudraSplit[1]);
            break;
        case 3:
            times[1] = getTime(kuudraSplit[2] - kuudraSplit[1]);
            times[2] = getTime(Date.now() / 1000 - kuudraSplit[2]);
            break;
        case 4:
            times[2] = getTime(kuudraSplit[3] - kuudraSplit[2]);
            times[3] = getTime(Date.now() / 1000 - kuudraSplit[3]);
            break;
        case 5:
            times[3] = getTime(kuudraSplit[4] - kuudraSplit[3]);
            break;
    }
    
    // Draw Splits
    splitsOverlay.message =
`${AQUA}${BOLD}Supplies: ${RESET}${times[0]}
${AQUA}${BOLD}Build: ${RESET}${times[1]}
${AQUA}${BOLD}Fuel/Stun: ${RESET}${times[2]}
${AQUA}${BOLD}Kuudra: ${RESET}${times[3]}`
    
})

// RESET
register("chat", () => {
    kuudraSplit = [0, 0, 0, 0];
    times = ['0s', '0s', '0s', '0s'];
    phase = 0;
}).setCriteria("[NPC] Elle: Talk with me to begin!");

// GET PLAYERS
register("chat", (player) => {
    player = player.toLowerCase();
    if (!party.includes(player)) party.push(player);
}).setCriteria("${player} is now ready!");

// FIRST SPLIT
register("chat", () => {
    if (!settings.kuudraSplits) return;

    kuudraSplit[0] = Date.now() / 1000;
    phase = 1;
}).setCriteria("[NPC] Elle: Okay adventurers, I will go and fish up Kuudra!");

// SECOND SPLIT
register("chat", () => {
    if (!settings.kuudraSplits) return;

    kuudraSplit[1] = Date.now() / 1000;
    phase = 2;
}).setCriteria("[NPC] Elle: OMG! Great work collecting my supplies!");

// THIRD SPLIT
register("chat", () => {
    if (!settings.kuudraSplits) return;

    kuudraSplit[2] = Date.now() / 1000;
    phase = 3;
}).setCriteria("[NPC] Elle: Phew! The Ballista is finally ready! It should be strong enough to tank Kuudra's blows now!");

// FOURTH SPLIT
register("chat", () => {
    if (!settings.kuudraSplits) return;
    
    kuudraSplit[3] = Date.now() / 1000;
    phase = 4;
}).setCriteria("[NPC] Elle: POW! SURELY THAT'S IT! I don't think he has any more in him!");

// END
register("chat", () => {
    if (!settings.kuudraSplits) return;
    
    kuudraSplit[4] = Date.now() / 1000;
    phase = 5;

    // Records last split and checks if no fucky wucky
    let broken = false;
    for (let i = 0; i < data.splits.last.length - 1; i++) {
        data.splits.last[i] = parseFloat(Math.abs(kuudraSplit[i + 1] - kuudraSplit[i]).toFixed(2));
        if (data.splits.last[i] > 69420 || data.splits.last[i] == 0) broken = true;
    }

    // Record Total
    data.splits.last[4] = parseFloat((data.splits.last[0] + data.splits.last[1] + data.splits.last[2] + data.splits.last[3]).toFixed(2));
    
    // Record splits
    let splitFormat = "";
    if (getWorld() == "kuudra t5") {
        // Check if new best split / run
        for (let i = 0; i < data.splits.last.length; i++) {
            if (!broken)
                splitFormat += `${data.splits.last[i]}, `;
            // Record best splits
            if (data.splits.last[i] < data.splits.best[i] && data.splits.last[i] != 0)
                data.splits.best[i] = data.splits.last[i];
            // Record worst splits
            if (data.splits.last[i] > data.splits.worst[i] && data.splits.last[i] < 999)
                data.splits.worst[i] = data.splits.last[i];
        }
        // Tracks when timer not infinite
        if (!broken) {
            splitFormat = splitFormat + mm+'/'+dd+'/'+yyyy + '\n';
            FileLib.append("./VolcAddons/data", "splits.txt", splitFormat);
            if (!data.files.includes("splits.txt")) 
                data.files.push("splits.txt");

            // Tracks splits for unique parties
            const fileMembers = party.sort().join("-") + ".txt";
            if (party.length == 4) {
                FileLib.append("./VolcAddons/data", fileMembers, splitFormat);
                if (!data.files.includes(fileMembers)) 
                    data.files.push(fileMembers);
            }
        }
    }

    // Resets party tracker
    party = [];
}).setCriteria("${before}KUUDRA DOWN${after}");

register("chat", () => {
    if (!settings.kuudraSplits) return;
    
    kuudraSplit[4] = Date.now() / 1000;
    phase = 5;
}).setCriteria("${before}DEFEAT${after}");

// PARTY CHAT COMMAND => RETURNS SPLITS TO /PC
let onCD = false;

register("chat", (player, message) => {
    const name = getPlayerName(player);
    if ((!settings.partyCommands && !name.equals(Player.getName())) || onCD) return;

    const args = message.split(" ");
    switch (args[0]) {
        case "splits":
        case "split":
        case "last":
            last = [getTime(data.splits.last[0]), getTime(data.splits.last[1]), getTime(data.splits.last[2]), getTime(data.splits.last[3]), getTime(data.splits.last[4])];
            setTimeout(() => { ChatLib.command(`pc Supplies: ${last[0]} | Build: ${last[1]} | Fuel/Stun: ${last[2]} | Kuudra: ${last[3]} | Total: ${last[4]}`) }, 500);
            break;
        case "best":
            best = [getTime(data.splits.best[0]), getTime(data.splits.best[1]), getTime(data.splits.best[2]), getTime(data.splits.best[3]), getTime(data.splits.best[4])];
            theory = getTime(data.splits.best[0] + data.splits.best[1] + data.splits.best[2] + data.splits.best[3]);
            setTimeout(() => { ChatLib.command(`pc Supplies: ${best[0]} | Build: ${best[1]} | Fuel/Stun: ${best[2]} | Kuudra: ${best[3]} | Total: ${best[4]} | Theoretical Best: ${theory}`) }, 500);
            break;
    }

    onCD = true;
    setTimeout(() => { onCD = false }, 500);
}).setCriteria("Party > ${player}: ?${message}");

// MOD COMMAND
function formatSplits(splits, color, runs) {
    if (color == GREEN) ChatLib.chat(`${DARK_GREEN}${BOLD}Average for last ${runs} runs:`);
    ChatLib.chat(`${color}${BOLD}Supplies: ${RESET}${getTime(splits[0])}`);
    ChatLib.chat(`${color}${BOLD}Build: ${RESET}${getTime(splits[1])}`);
    ChatLib.chat(`${color}${BOLD}Fuel/Stun: ${RESET}${getTime(splits[2])}`);
    ChatLib.chat(`${color}${BOLD}Kuudra: ${RESET}${getTime(splits[3])}`);
    ChatLib.chat(`${color}${BOLD}Overall Run: ${RESET}${getTime(splits[4])}`);
    if (color == GOLD) {
        const theory = (data.splits.best[0] + data.splits.best[1] + data.splits.best[2] + data.splits.best[3]).toFixed(2);
        ChatLib.chat(`${color}${BOLD}Theoretical Best: ${RESET}${getTime(theory)}`);
    }
    if (color == RED) {
        const conjecture = (data.splits.worst[0] + data.splits.worst[1] + data.splits.worst[2] + data.splits.worst[3]).toFixed(2);
        ChatLib.chat(`${color}${BOLD}Theoretical Worst: ${RESET}${getTime(conjecture)}`);
    }
}

export function getSplits(args){
    if (args[1] != undefined) {
        switch (args[1]) {
            case "last":
                formatSplits(data.splits.last, AQUA, 0);
                break;
            case "best":
                formatSplits(data.splits.best, GOLD, 0);
                break;
            case "worst":
                formatSplits(data.splits.worst, RED, 0);
                break;
            case "today":
                const today = true;
            case "average":
                // Gets file name
                let fileName = "splits.txt";
                if (args[6] != undefined) fileName = [args[3], args[4], args[5], args[6]].map(p => p.toLowerCase()).sort().join("-") + ".txt";
                else if (args[5] != undefined) fileName = [args[2], args[3], args[4], args[5]].map(p => p.toLowerCase()).sort().join("-") + ".txt";

                const fileSplits = FileLib.read("./VolcAddons/data", fileName);

                // Get runs from file
                if (fileSplits) {
                    let runs = fileSplits.split("\n");
                    runs.pop();

                    // Filter by date
                    if (isValidDate(args[2]))
                        runs = runs.filter((run) => run.split(", ")[5] == args[2]);
                    if (today || args[2] == "today")
                        runs = runs.filter((run) => run.split(", ")[5] == (mm+"/"+dd+"/"+yyyy));
                    
                    // Get # of runs to average
                    let runsWanted = runs.length;
                    if (!isNaN(args[2])) if (args[2] < runsWanted) runsWanted = args[2];

                    // Average the runs
                    let average = [0, 0, 0, 0, 0];
                    let run = undefined;
                    for (let i = runs.length - 1; i >= runs.length - runsWanted; i--) {
                        run = runs[i].split(", ");
                        if (run.length > 1) for (let j = 0; j < average.length; j++) average[j] += parseFloat(run[j]);
                    }
                    for (let i = 0; i < average.length; i++) average[i] = average[i] / runsWanted;

                    formatSplits(average, GREEN, runsWanted);
                } else ChatLib.chat(`${RED}File [${fileName}${RED}] not found!`);
                break;
            case "clear":
                // Clears every split
                data.files.forEach(file => {
                    FileLib.delete("./VolcAddons/data", file);
                });
                data.files = [];
                
                ChatLib.chat(`${LOGO} ${GREEN}Succesfully cleared splits!`)
                break;
            default:
                ChatLib.chat(`${LOGO} ${AQUA}Please enter as /va splits <last, best, today, average ${ITALIC}<[# of runs], [player members], [mm/dd/yyyy]>${RESET}${AQUA}, clear>!`);
                break;
        }
    } else ChatLib.chat(`${LOGO} ${AQUA}Please enter as /va splits <last, best, today, average ${ITALIC}<[# of runs], [player members], [mm/dd/yyyy]>${RESET}${AQUA}, clear>!`);
}