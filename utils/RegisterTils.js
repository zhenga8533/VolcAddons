import Settings from "./Settings";

const registers = [];

/**
 * Adds a trigger with its associated dependency to the list of registered triggers.
 * Credit to: https://www.chattriggers.com/modules/v/BloomCore for idea
 *
 * @param {Object} trigger - The trigger to be added.
 * @param {Function} dependency - The function representing the dependency of the trigger.
 */
export function registerWhen(trigger, callback) {
  trigger.unregister();
  registers.push({
    trigger: trigger,
    callback: callback,
    active: false,
  });
}

/**
 * Registers and unregisters all registers that need a world or setting to be active.
 *
 * @param {Boolean} off - Unregisters all registers if true.
 */
export function setRegisters(off = false) {
  registers.forEach((reg) => {
    if (!Settings.vaToggle || off || (reg.active && !reg.callback())) {
      reg.trigger.unregister();
      reg.active = false;
    } else if (!reg.active && reg.callback()) {
      reg.trigger.register();
      reg.active = true;
    }
  });
}

// Set registers on settings close
register("guiClosed", (event) => {
  if (!event.toString().startsWith("gg.essential.vigilance.gui.SettingsGui")) return;

  setRegisters((off = Settings.skyblockToggle && !Scoreboard.getTitle().removeFormatting().includes("SKYBLOCK")));
});
