import { data } from "./variables";


export class Stat {
    constructor() {
        this.reset();
    }

    /**
     * Resets all stat tracking variables.
     */
    reset() {
        this.start = 0.00; // Starting amount
        this.now = 0.00; // Current amount
        this.time = 1; // Time passed
        this.since = 600; // Time since last amount earn
        this.level = 0; // Skill level
    }

    /**
     * Calculates current gain of current stat.
     * 
     * @returns {Number} Gained stat number from start.
     */
    getGain() {
        return this.now - this.start;
    }

    /**
     * Calculates rate of gain an hour.
     * 
     * @returns {Number} stat / hour.
     */
    getRate() {
        return this.getGain() / this.time * 3_600;
    }
}

/**
 * Returns the current paused state.
 *
 * @returns {boolean} - The current paused state.
 */
let paused = false;
export function getPaused() {
    return paused;
}

// Key binding for pausing or unpausing trackers
const pauseKey = new KeyBind("Pause Trackers", data.pauseKey, "./VolcAddons.xdd");

pauseKey.registerKeyPress(() => {
    paused = !paused;
    const message = paused ? `${RED}Paused` : `${GREEN}Resumed`;
    ChatLib.chat(`${LOGO + GOLD}Tracker ${message}!`);
});

register("gameUnload", () => {
    data.pauseKey = pauseKey.getKeyCode();
});
