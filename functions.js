export function getTime(time) {
    let minutes = Math.floor(parseFloat(time) / 60);
    let seconds = (parseFloat(time) % 60).toFixed(2);

    // Rounds like what hypixel actually does
    if (Math.round(seconds) == 60) {
        minutes++;
        seconds = 0;
    }

    if (minutes > 0) return `${minutes}m${Math.round(seconds)}s`;
    else return `${seconds}s`;
}