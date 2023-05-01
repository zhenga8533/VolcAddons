import settings from "../settings"

// REMOVE SELFIE MODE (boppeler21 cutie)
register("tick", () => {
    if(!settings.removeSelfie || Client.settings.getSettings().field_74320_O != 2) return;
    
    Client.settings.getSettings().field_74320_O = 0;
})