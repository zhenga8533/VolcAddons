import { data } from "./Data";
import { Json } from "./Json";

/**
 * Save stats on game unload.
 */
const stats = [];
register("gameUnload", () => {
  stats.forEach((stat) => {
    stat.json.setData({
      start: stat.now,
      now: stat.now,
      time: 1,
      since: 600,
      level: stat.level,
    });
  });
}).setPriority(Priority.HIGHEST);

export class Stat {
  /**
   * Base class for tracking stats.
   *
   * @param {String} name - The name of the stat.
   */
  constructor(name) {
    stats.push(this);
    this.json = new Json(name + ".json", true, true, "stats/");
    this.reset();
    this.loadData();
  }

  /**
   * Loads data from the JSON file.
   */
  loadData() {
    const data = this.json.getData();
    if (Object.keys(data).length === 0) return;
    this.start = data.start;
    this.now = data.now;
    this.time = data.time;
    this.since = data.since;
    this.level = data.level;
  }

  /**
   * Resets all stat tracking variables.
   */
  reset() {
    this.start = 0.0; // Starting amount
    this.now = 0.0; // Current amount
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
    return (this.getGain() / this.time) * 3_600;
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
}).setPriority(Priority.HIGHEST);
