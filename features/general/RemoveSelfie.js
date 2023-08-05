import settings from "../../settings";


/**
 * Removes first person view in f5. (ty boppeler21 qt)
 */
new KeyBind("Persepctive Override", Client.getKeyBindFromDescription("key.togglePerspective").keyCode, "VolcAddons").registerKeyPress(() => {
    Client.settings.getSettings().field_74320_O = (Client.settings.getSettings().field_74320_O + 1) % 3;
    if (!settings.removeSelfie) return;
    Client.settings.getSettings().field_74320_O %= 2;
})
