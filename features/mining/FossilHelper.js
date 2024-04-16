import { BOLD, DARK_AQUA, DARK_GRAY, GOLD, GRAY, RED } from "../../utils/constants";
import { getSlotCoords } from "../../utils/functions/find";
import { createMatrix, getAllFormations } from "../../utils/functions/matrix";
import { Overlay } from "../../utils/overlay";
import settings from "../../utils/settings";
import { data, registerWhen } from "../../utils/variables";


const FOSSILS = {
    "Spine": [
        [1, -1, -1],
        [1, 1, -1],
        [1, 1, 1],
        [1, 1, 1],
        [1, 1, -1],
        [1, -1, -1]
    ],
    "Helix": [
        [1, 1, 1, 1],
        [-1, -1, -1, 1],
        [1, 1, -1, 1],
        [1, -1, -1, 1],
        [1, 1, 1, 1]
    ],
    "Footprint": [
        [1, -1, 1, -1, 1],
        [1, -1, 1, -1, 1],
        [-1, 1, 1, 1, -1],
        [-1, 1, 1, 1, -1],
        [-1, -1, 1, -1, -1]
    ],
    "Webbed": [
        [-1, -1, -1, 1, -1, -1, -1],
        [1, -1, -1, 1, -1, -1, 1],
        [-1, 1, -1, 1, -1, 1, -1],
        [-1, -1, 1, 1, 1, -1, -1]
    ],
    "Claw": [
        [-1, 1, -1, 1, -1, -1],
        [1, -1, 1, -1, 1, -1],
        [-1, 1, -1, 1, 1, -1],
        [-1, -1, 1, 1, 1, 1],
        [-1, -1, -1, -1, 1, -1]
    ],
    "Tusk": [
        [-1, -1, 1, -1, -1],
        [-1, 1, -1, 1, -1],
        [1, -1, -1, -1, -1],
        [-1, 1, -1, -1, -1],
        [-1, -1, 1, 1, 1]
    ],
    "Clubbed": [
        [-1, 1, 1, 1, 1, -1, -1, -1],
        [1, -1, -1, -1, -1, 1, -1, -1],
        [-1, 1, -1, -1, -1, -1, 1, 1],
        [-1, -1, -1, -1, -1, -1, 1, 1]
    ],
    "Ugly": [
        [-1, 1, -1, -1],
        [1, 1, 1, -1],
        [1, 1, 1, 1],
        [1, 1, 1, 1],
        [1, 1, 1, -1],
        [-1, 1, -1, -1]
    ]
}
const FOSSIL_PERCENTS = {
    "8.3%": ["Spine"],
    "7.1%": ["Helix"],
    "7.7%": ["Footprint", "Claw"],
    "10%": ["Webbed"],
    "12.5%": ["Tusk"],
    "9.1%": ["Clubbed"],
    "6.2%": ["Ugly"]
};
let patterns = FOSSILS;
let board = [];
let bestTile = [2, 4];

const fossilExample = `${DARK_AQUA + BOLD}Possible:
 ${DARK_GRAY} - ${GOLD}Praise
 ${DARK_GRAY} - ${GOLD}Lord
 ${DARK_GRAY} - ${GOLD}Helix`;
const fossilOverlay = new Overlay("fossilHelper", ["Dwarven Mines", "misc"], () => Player.getContainer()?.getName() === "Fossil Excavator", data.FHL, "moveFossil", fossilExample);

/**
 * Finds the excavator slot with the highest probability of being a fossil piece.
 * My algorithm might be wis :skull:
 * 
 * @returns [i, j] - Coord of most likely fossil slot or [-1, -1] if there is none.
 */
function findTile() {
    const formations = {};
    Object.keys(patterns).forEach(pattern => {
        formations[pattern] = getAllFormations(patterns[pattern]);
    });
    const possibilityBoard = createMatrix(6, 9);
    const fossilPossibility = {
        "Spine": 0,
        "Helix": 0,
        "Footprint": 0,
        "Claw": 0,
        "Webbed": 0,
        "Tusk": 0,
        "Clubbed": 0,
        "Ugly": 0
    };
    let totalPossible = 0;

    /**
     * Adds a formation to the possibility board at the specified position.
     * @param {number} i - The row index where the formation should be added.
     * @param {number} j - The column index where the formation should be added.
     * @param {Array} formation - The formation to be added to the possibility board.
     */
    function addFormation(i, j, fossil, formation) {
        fossilPossibility[fossil]++;
        totalPossible++;

        for (let m = 0; m < formation.length; m++) {
            for (let n = 0; n < formation[m].length; n++) {
                if (formation[m][n] === 1) {
                    possibilityBoard[i + m][j + n] += 1;
                }
            }
        }
    }

    /**
     * Checks if a formation can be placed on the board at the specified position.
     * If possible, adds the formation to the possibility board.
     * @param {number} i - The row index where the formation is to be checked.
     * @param {number} j - The column index where the formation is to be checked.
     * @param {Array} formation - The formation to be checked and potentially added to the possibility board.
     */
    function checkFormation(i, j, fossil, formation) {
        for (let m = 0; m < formation.length; m++) {
            for (let n = 0; n < formation[0].length; n++) {
                if (board[i + m][j + n] === -1 && formation[m][n] === 1) return;
                if (board[i + m][j + n] === 1 && formation[m][n] === -1) return;
            }
        }
        addFormation(i, j, fossil, formation);
    }

    // Find 1s box that must be checked
    let topLeft = undefined;
    let bottomRight = undefined;
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            if (board[i][j] === 1) {
                if (topLeft === undefined) {
                    topLeft = [i, j];
                    bottomRight = [i, j];
                } else {
                    // Update topLeft
                    topLeft[0] = Math.min(topLeft[0], i);
                    topLeft[1] = Math.min(topLeft[1], j);

                    // Update bottomRight
                    bottomRight[0] = Math.max(bottomRight[0], i);
                    bottomRight[1] = Math.max(bottomRight[1], j);
                }
            }
        }
    }
    
    // 8 * 8 * 4 * 5 * 5 * 4 = O(25600) = constant agreege
    Object.keys(formations).forEach(fossil => {
        const pattern = formations[fossil];
        pattern.forEach(formation => {
            for (let i = 0; i <= board.length - formation.length; i++) {
                for (let j = 0; j <= board[0].length - formation[0].length; j++) {
                    if (topLeft === undefined || (topLeft[0] >= i && topLeft[1] >= j && bottomRight[0] < i + formation.length && bottomRight[1] < j + formation[0].length))
                        checkFormation(i, j, fossil, formation);
                }
            }
        });
    });

    // Determine best tile
    let best = [-1, -1];
    let maxPos = 0;
    for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 9; j++) {
            if (board[i][j] !== 1 && possibilityBoard[i][j] > maxPos) {
                best = [i, j];
                maxPos = possibilityBoard[i][j];
            }
        }
    }

    // Update fossil display
    fossilOverlay.message = `${DARK_AQUA + BOLD}Fossil Possibility:`;
    if (maxPos === 0) fossilOverlay.message += `\n ${RED}No possible fossils!`;
    else {
        Object.keys(fossilPossibility).forEach(fossil => {
            const possibility = fossilPossibility[fossil] / totalPossible * 100;
            if (possibility !== 0) fossilOverlay.message += `\n ${DARK_GRAY}- ${GOLD + fossil} ${GRAY}(${possibility.toFixed(2)}%)`
        });
    }
    
    return best;
}

const highlightTile = register("guiRender", () => {
    const containerType = Player.getContainer().getClassName();
    const [x, y] = getSlotCoords(bestTile[0] * 9 + bestTile[1], containerType);

    Renderer.translate(0, 0, 100);
    Renderer.drawRect(Renderer.DARK_GREEN, x, y, 16, 16);
}).unregister();

const trackClicks = register("guiMouseClick", () => {
    Client.scheduleTask(2, () => {
        const container = Player.getContainer().getItems();
        const fossil = container.find(item => item?.getName() === "§6Fossil");
        
        // Determine possible fossil types
        if (fossil !== undefined && Object.keys(patterns).length > 2) {
            const progress = fossil.getLore()[6].split(' ');
            const percent = progress[progress.length - 1].removeFormatting();
            if (percent in FOSSIL_PERCENTS) {
                patterns = {};
                FOSSIL_PERCENTS[percent].forEach(fossilType => {
                    patterns[fossilType] = FOSSILS[fossilType];
                });
            }
        }

        // Set board
        board = [];
        for (let i = 0; i < 6; i++) {
            board.push([]);
            for (let j = 0; j < 9; j++) {
                let index = i * 9 + j;
                let slot = container[index]?.getName();
                if (slot === undefined) board[i].push(-1);
                else if (slot === "§6Dirt") board[i].push(0);
                else if (slot === "§6Fossil") board[i].push(1);
                else board[i].push(-1);
            }
        }

        bestTile = findTile();
    });
}).unregister();

const untrackFossils = register("guiClosed", () => {
    trackClicks.unregister();
    untrackFossils.unregister();
    highlightTile.unregister();
    patterns = FOSSILS;
    board = [];
    bestTile = [2, 4];
}).unregister();

registerWhen(register("guiOpened", () => {
    Client.scheduleTask(2, () => {
        const container = Player.getContainer();
        if (container.getName() !== "Fossil Excavator" || container.getItems()[49].getName() === "§cClose") return;
        highlightTile.register();
        trackClicks.register();
        untrackFossils.register();
    })
}), () => settings.fossilHelper);
