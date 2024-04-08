import { BOLD, DARK_GREEN, GRAY, GREEN } from "../../utils/constants";
import { Overlay } from "../../utils/overlay";
import settings from "../../utils/settings";
import { data, registerWhen } from "../../utils/variables";


let community = {};
let personal = {};
const bingoExample = 
`${DARK_GREEN}Community Goals
 ${GRAY}Bingo${GREEN}! ${GRAY}Bingo${GREEN}! ${GRAY}Bingo${GREEN}!
 ${GRAY}Fun time Bingo${GREEN}!
 ${GRAY}Earth is a fine place to be${GREEN}, ${GRAY}yo${GREEN}!
 ${GRAY}The food is tasty too, yo${GREEN}!
 ${GRAY}Let${GREEN}'${GRAY}s go play${GREEN}-${GRAY}o${GREEN}, ${GRAY}let${GREEN}'${GRAY}s be friends${GREEN}-${GRAY}o${GREEN}!
 ${GRAY}Fun time${GREEN}, ${GRAY}bingo${GREEN}!
 ${GRAY}Time to play some bingo${GREEN}!

${DARK_GREEN}Bingo Goals
 ${GRAY + BOLD}ビンゴ${GREEN}！
 ${GRAY + BOLD}ビンゴ${GREEN}！
 ${GRAY + BOLD}ビンゴ${GREEN}！
 ${GRAY + BOLD}楽しいビンゴタイム${GREEN}！
 ${GRAY + BOLD}地球は素晴らしい場所だよ${GREEN}、${GRAY + BOLD}よ${GREEN}！
 ${GRAY + BOLD}食べ物も美味しいですよ${GREEN}！
 ${GRAY + BOLD}遊びに行きましょう${GREEN}、${GRAY + BOLD}友達になりましょう${GREEN}！
 ${GRAY + BOLD}楽しい時間${GREEN}、${GRAY + BOLD}ビンゴ${GREEN}！
 ${GRAY + BOLD}ビンゴをする時間です${GREEN}！`;
const bingoOverlay = new Overlay("bingoCard", ["all"], () => true, data.BCL, "moveBingo", bingoExample);
bingoOverlay.message = "";

/**
 * Updates bingo overlay based on current uncompleted goals.
 */
function updateBingo() {
    bingoOverlay.message = "";

    // Update community bingo goals
    if (settings.bingoCard === 1 || settings.bingoCard === 3) {
        bingoOverlay.message += `${DARK_GREEN + BOLD}Community Goals\n`;
        Object.keys(community).forEach(goal => {
            bingoOverlay.message += ` ${community[goal]}\n`;
        });
    }

    bingoOverlay.message += '\n';

    // Update peersonal bingo goals
    if (settings.bingoCard === 1 || settings.bingoCard === 2) {
        bingoOverlay.message += `${DARK_GREEN + BOLD}Bingo Goals\n`;
        Object.keys(personal).forEach(goal => {
            bingoOverlay.message += ` ${personal[goal]}\n`;
        });
    }
}

registerWhen(register("guiOpened", () => {
    Client.scheduleTask(3, () => {
        const inv = Player.getContainer();
        if (inv.getName() !== "Bingo Card") return;

        const items = inv.getItems();
        community = {};
        personal = {};

        // Loop through card and seperate community/personal goals
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 5; j++) {
                let item = items[(i * 9) + j + 2];
                let name = item.getName();
                let lore = item.getLore();
                let completed = lore[lore.length -1] === "§5§o§aGOAL REACHED";
                let goal = item.getLore()[3];
                if (i === j) community[name] = goal;
                else if (!completed) personal[name] = goal;
            }
        }

        updateBingo();
    });
}), () => settings.bingoCard !== 0);

registerWhen(register("chat", (goal) => {
    if (goal in personal) delete personal[goal];
    updateBingo();
}).setCriteria("BINGO GOAL COMPLETE! ${goal}"), () => settings.bingoCard !== 0);

registerWhen(register("chat", () => {
    bingoOverlay.message = "";
}).setCriteria("Switching to profile ${profile}..."), () => settings.bingoCard !== 0);
