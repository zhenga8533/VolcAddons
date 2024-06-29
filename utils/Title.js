const titles = {};
let current = "";
let prio = 0;

/**
 * Set the title of the player.
 *
 * @param {String} title - Title of the message.
 * @param {String} subtitle - Subtitle of the message.
 * @param {Number} fadeIn - Fade in time in ticks.
 * @param {Number} time - Display time in ticks.
 * @param {Number} fadeOut - Fade out time in ticks.
 * @param {Number} priority - Higher number means higher priority.
 */
export function setTitle(title, subtitle, fadeIn, time, fadeOut, priority = 5) {
  const ticks = fadeIn + time + fadeOut;
  titles[title] = {
    subtitle: subtitle,
    fadeIn: fadeIn,
    time: time,
    fadeOut: fadeOut,
    ticks: ticks,
    priority: priority,
  };

  if (priority >= prio) {
    Client.showTitle(title, subtitle, fadeIn, time, fadeOut);
    current = title;
    prio = priority;
  }
}

register("tick", () => {
  Object.keys(titles).forEach((title) => {
    if (titles[title].ticks-- <= 0) delete titles[title];
  });

  // Find highest priority title
  if (Object.keys(titles).length === 0) {
    current = "";
    prio = 0;
    return;
  } else if (current === "" || !titles.hasOwnProperty(current)) {
    current = Object.keys(titles).reduce((a, b) => {
      if (titles[a] && titles[b]) {
        return titles[a].priority > titles[b].priority ? a : b;
      }
      return a || b;
    }, null);
    prio = titles[current].priority;
    const title = titles[current];

    // Draw title
    Client.showTitle(current, title.subtitle, title.fadeIn, title.time, title.fadeOut);
  }
});

register("renderTitle", (title, _, event) => {
  if (current !== "" && title !== current) cancel(event);
}).setPriority(Priority.LOWEST);
