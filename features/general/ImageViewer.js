import settings from "../../utils/settings";
import { registerWhen } from "../../utils/variables";


/**
 * Variables used to determine image rendering.
 */
let SCREEN_WIDTH = Renderer.screen.getWidth();
let SCREEN_HEIGHT = Renderer.screen.getHeight();
let img = undefined;
let imgUrl = undefined;

/**
 * Sets size of screen.
 */
register("worldLoad", () => {
    SCREEN_WIDTH = Renderer.screen.getWidth();
    SCREEN_HEIGHT = Renderer.screen.getHeight();
});

/**
 * Renders the image on cursor location / lowest xy.
 */
registerWhen(register("renderOverlay", () => {
    if (img === undefined) return;
    const imgWidth = img.getTextureWidth();
    const imgHeight = img.getTextureHeight();
    const ratio =  (imgWidth / SCREEN_WIDTH > imgHeight / SCREEN_HEIGHT ? imgWidth / SCREEN_WIDTH : imgHeight / SCREEN_HEIGHT) / settings.imageRatio;
    const width = imgWidth / ratio;
    const height = imgHeight / ratio;
    img.draw(Math.min(Client.getMouseX(), SCREEN_WIDTH - width), Math.max(0, Client.getMouseY() - height), width, height);
}).setPriority(Priority.LOWEST), () => settings.imageRatio !== 0);

/**
 * Gets image when hovering over Imgur/Discord link.
 */
registerWhen(register("chatComponentHovered", (text) => {
    const hoverValue = text.getHoverValue().removeFormatting();
    if (hoverValue === imgUrl || !(hoverValue.includes("imgur.com") || hoverValue.includes("cdn.discordapp"))) return;
    imgUrl = hoverValue;
    try {
        img = Image.fromUrl(imgUrl);
    } catch (err) {}
}), () => settings.imageRatio !== 0);

/**
 * Resets image on gui close.
 */
registerWhen(register("guiClosed", () => {
    img = undefined;
    imgUrl = undefined;
}), () => settings.imageRatio !== 0);
