import { AQUA, BOLD, GREEN } from "../../utils/Constants";
import { data } from "../../utils/Data";
import { Overlay } from "../../utils/Overlay";
import { registerWhen } from "../../utils/RegisterTils";
import Settings from "../../utils/Settings";

const widgetOverlays = {};

/**
 * Updates widget overlays list to correctly match widgetlist in data.
 */
export function updateWidgetList() {
  data.widgetlist.forEach((widget) => {
    if (widget in widgetOverlays) return;
    if (!(widget in data.WGL)) data.WGL[widget] = [100, 100, 1.2, false, false];
    widgetOverlays[widget] = new Overlay(
      "widgetDisplay",
      data.WGL[widget],
      `move${widget.replace(/\s/g, "")}`,
      `${AQUA + BOLD + widget}:
 Statistic ${GREEN}1
 Statistic ${GREEN}2
 Statistic ${GREEN}3
 Statistic ${GREEN}FOUR`
    );
  });

  Object.keys(widgetOverlays).forEach((widget) => {
    widgetOverlays[widget].setMessage("");
    if (!data.widgetlist.includes(widget)) delete widgetOverlays[widget];
  });
}
updateWidgetList();

registerWhen(
  register("step", () => {
    if (!World.isLoaded()) return;
    const tablist = TabList.getNames();

    Object.keys(widgetOverlays).forEach((widget) => {
      let index = tablist.findIndex((line) => line.removeFormatting().toLowerCase() === `${widget.toLowerCase()}:`);
      if (index === -1) {
        widgetOverlays[widget].setMessage("");
        return;
      }

      let message = tablist[index++];
      while (tablist[index].startsWith("§r ") && !tablist[index].endsWith("§r§3§lInfo§r"))
        message += "\n" + tablist[index++];
      widgetOverlays[widget].setMessage(message);
    });
  }).setFps(1),
  () => Settings.widgetDisplay
);
