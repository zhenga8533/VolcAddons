const titles = {};
let prio = "";

export function setTitle(title, subtitle, fadeIn, time, fadeOut, priority=5) {
    const ticks = fadeIn + time + fadeOut;
    titles[title] = {
        "subtitle": subtitle,
        "fadeIn": fadeIn,
        "time": time,
        "fadeOut": fadeOut,
        "ticks": ticks,
        "priority": priority
    }
}

register("tick", () => {
    Object.keys(titles).forEach(title => {
        if (titles[title].ticks-- <= 0)
            delete titles[title];
    });

    // Find highest priority title
    prio = Object.keys(titles).reduce((a, b) => titles[a].priority > titles[b].priority ? a : b, null);
    const title = titles[prio];

    // Draw title
    Client.showTitle(prio, title.subtitle, title.fadeIn, title.time, title.fadeOut);
});

register("renderTitle", (title, _, event) => {
    if (title !== prio) cancel(event);
})
