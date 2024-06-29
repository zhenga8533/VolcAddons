import { registerWhen } from "../../utils/RegisterTils";
import Settings from "../../utils/Settings";

/**
 * Variables used to represent F5 key bind.
 */
let key = new KeyBind(Client.getMinecraft().field_71474_y.field_151457_aa);
let keyPressed = false;

/**
 * Removes first person view in f5. (ty boppeler21 qt)
 */
registerWhen(
  register("tick", () => {
    try {
      if (Client.settings.getSettings().field_74320_O === 2) Client.settings.getSettings().field_74320_O = 0;
      else if (Keyboard.isKeyDown(key.getKeyCode()) && !keyPressed) {
        if (Client.settings.getSettings().field_74320_O === 1) Client.settings.getSettings().field_74320_O = 2;
        keyPressed = true;
      } else if (!Keyboard.isKeyDown(key.getKeyCode()) && keyPressed) keyPressed = false;
    } catch (err) {
      if (Client.settings.getSettings().field_74320_O === 2) Client.settings.getSettings().field_74320_O = 0;
    }
  }),
  () => Settings.removeSelfie === true
);
