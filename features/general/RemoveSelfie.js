import settings from "../../settings";
import { registerWhen } from "../../utils/variables";

const key = new KeyBind(Client.getMinecraft().field_71474_y.field_151457_aa);
keyPressed = false;

/**
 * Removes first person view in f5. (ty boppeler21 qt)
 */
registerWhen(register('tick', () => {
    if (Keyboard.isKeyDown(key.getKeyCode()) && !keyPressed) {
        if (Client.settings.getSettings().field_74320_O === 1)
            Client.settings.getSettings().field_74320_O = 2;
        keyPressed = true;
    }
    else if (!Keyboard.isKeyDown(key.getKeyCode()) && keyPressed)
        keyPressed = false;
}), () => settings.removeSelfie);
