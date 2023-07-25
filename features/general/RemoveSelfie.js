import settings from "../../settings";
import { registerWhen } from "../../utils/variables";


/**
 * Removes first person view in f5. (ty boppeler21 qt)
 */
registerWhen(register("tick", () => {
    if(Client.settings.getSettings().field_74320_O != 2) return;
    
    Client.settings.getSettings().field_74320_O = 0;
}), () => settings.removeSelfie);
