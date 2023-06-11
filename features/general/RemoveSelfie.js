import settings from "../../settings"
import { registerWhen } from "../../utils/variables";

// REMOVE SELFIE MODE (boppeler21 cutie)
registerWhen(register("tick", () => {
    if(Client.settings.getSettings().field_74320_O != 2) return;
    
    Client.settings.getSettings().field_74320_O = 0;
}), () => settings.removeSelfie);
