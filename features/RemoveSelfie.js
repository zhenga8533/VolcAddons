import settings from "../settings"

// REMOVE SELFIE MODE
register("tick", () => {
    if(settings.removeSelfie && Client.settings.getSettings().field_74320_O == 2) {
        Client.settings.getSettings().field_74320_O = 0
    }
})