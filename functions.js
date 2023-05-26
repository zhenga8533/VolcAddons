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

export function isValidDate(dateString) {
    // First check for the pattern
    if(!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString))
        return false;

    // Parse the date parts to integers
    var parts = dateString.split("/");
    var day = parseInt(parts[1], 10);
    var month = parseInt(parts[0], 10);
    var year = parseInt(parts[2], 10);

    // Check the ranges of month and year
    if(year < 1000 || year > 3000 || month == 0 || month > 12)
        return false;

    var monthLength = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];

    // Adjust for leap years
    if(year % 400 == 0 || (year % 100 != 0 && year % 4 == 0))
        monthLength[1] = 29;

    // Check the range of the day
    return day > 0 && day <= monthLength[month - 1];
};