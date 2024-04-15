import settings from "../../utils/settings";
import { AQUA, BOLD, GREEN } from "../../utils/constants";
import { Overlay } from "../../utils/overlay";
import { data, registerWhen } from "../../utils/variables"


const widgetOverlays = {};

/**
 * Updates widget overlays list to correctly match widgetlist in data.
 */
export function updateWidgetList() {
    data.widgetlist.forEach(widget => {
        if (widget in widgetOverlays) return;
        if (!(widget in data.WGL)) data.WGL[widget] = [100, 100, 1.2, false, false];
        widgetOverlays[widget] = new Overlay("widgetDisplay", ["all"], () => true, data.WGL[widget], `move${widget.replace(/\s/g, "")}`, 
`${AQUA + BOLD + widget}:
 Statistic ${GREEN}1
 Statistic ${GREEN}2
 Statistic ${GREEN}3
 Statistic ${GREEN}FOUR`);
    });

    Object.keys(widgetOverlays).forEach(widget => {
        if (!data.widgetlist.includes(widget)) delete widgetOverlays[widget];
    })
}
updateWidgetList();

registerWhen(register("step", () => {
    if (!World.isLoaded()) return;
    const tablist = TabList.getNames();

    Object.keys(widgetOverlays).forEach(widget => {
        let index = tablist.findIndex(line => line.removeFormatting().toLowerCase() === `${widget.toLowerCase()}:`);
        if (index === -1) {
            widgetOverlays[widget].message = "";
            return;
        }

        let message = tablist[index++] + '\n';
        while (tablist[index].startsWith("§r ")) message += tablist[index++] + '\n';
        widgetOverlays[widget].message = message;
    });
}).setFps(1), () => settings.widgetDisplay);
