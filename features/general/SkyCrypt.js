import { GREEN, LOGO, RED, WHITE } from "../../utils/Constants";

/**
 * Opens the SkyCrypt page of inputted ign.
 */
register("command", (name) => {
  if (name === undefined) {
    ChatLib.chat(`${LOGO + RED}Please input as: ${WHITE}/sk [ign]`);
    return;
  }

  const Desktop = Java.type("java.awt.Desktop");
  const URI = Java.type("java.net.URI");
  Desktop.getDesktop().browse(new URI(`https://sky.shiiyu.moe/stats/${name}`));
  ChatLib.chat(`${LOGO + GREEN}Opening ${name + (name[name.length - 1] === "s" ? "'" : "'s")} SkyCrypt profile!`);
})
  .setName("sk", true)
  .setAliases("skycrypt");
