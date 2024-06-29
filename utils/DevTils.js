import { GRAY, GREEN, LOGO } from "./Constants";
import { data } from "./Data";

/**
 * Dev mode
 */
const devKey = new KeyBind("Developer Mode", data.devKey, "./VolcAddons.xdd");
register("gameUnload", () => {
  data.devKey = devKey.getKeyCode();
}).setPriority(Priority.HIGHEST);

devKey.registerKeyPress(() => {
  if (devKey.getKeyCode() === 0 || !data.devMode) return;

  const view = Player.lookingAt();
  if (view instanceof Entity) {
    // Get entity data
    const entity = view.entity;
    const extraData = {
      nbt: entity.getEntityData(),
      persistantID: entity.persistentID,
      entityClass: entity.class,
      entityAttribute: entity.func_70668_bt(),
      maxHP: entity.func_110148_a(SMA.field_111267_a).func_111125_b(),
      pitch: entity.field_70125_A,
      yaw: entity.field_70177_z,
      ticksAlive: entity.field_70173_aa,
    };
    const textComponent = entity.func_145748_c_();
    let extraString = "";
    for (data in extraData) extraString += `${data}=${extraData[data]}, `;
    ChatLib.command(`ct copy ${view.toString()} ⦿ ${textComponent} ⦿ ExtraData[${extraString}]`, true);
    ChatLib.chat(`${LOGO + GREEN}Successfully copied entity data!`);
  } else {
    ChatLib.command(`ct copy ${view.toString()}`, true);
    ChatLib.chat(`${LOGO + GREEN}Successfully copied block data!`);
  }
});

register("guiKey", (_, keyCode, gui) => {
  if (keyCode !== devKey.getKeyCode() || !data.devMode) return;

  const slot = gui?.getSlotUnderMouse()?.field_75222_d;
  if (slot === undefined) return;
  const item = Player.getContainer().getStackInSlot(slot);
  if (item === null) return;
  ChatLib.command(`ct copy ${JSON.stringify(item.getNBT().toObject(), null, 2)}`, true);
  ChatLib.chat(`${LOGO + GREEN}Successfully copied ${GRAY}[${item.getName() + GRAY}] ${GREEN}NBT!`);
});

/**
 * Dev commands
 */
register("command", (...args) => {
  ChatLib.command("ct copy " + args.join(" "), true);
  ChatLib.chat(`${LOGO + GREEN}Successfully copied text to clipboard!`);
}).setName("vacopy");

register("command", () => {
  TabList.getNames().forEach((name) => {
    print(name);
  });
  ChatLib.chat(`${LOGO + GREEN}Succesfully printed TabList names to console!`);
}).setName("printTab");

register("command", () => {
  Scoreboard.getLines().forEach((line) => {
    print(line.getName());
  });
  ChatLib.chat(`${LOGO + GREEN}Succesfully printed Scoreboard lines to console!`);
}).setName("printScore");

export function printKeys(object) {
  Object.keys(object).forEach((key) => print(key));
}
