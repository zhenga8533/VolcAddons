export function getTime(time) {
    let minutes = Math.floor(parseFloat(time) / 60);
    let seconds = (parseFloat(time) % 60).toFixed(2);

    // Rounds like what hypixel actually does
    if (Math.round(seconds) == 60) {
        minutes++;
        seconds = 0;
    }

    if (minutes > 0) {
        if (seconds < 9.5)
            return `${minutes}m0${Math.round(seconds)}s`;
        else
            return `${minutes}m${Math.round(seconds)}s`;
    }
    else return `${seconds}s`;
};

export function commafy(num) {
    return num.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// GUI Stuff
export function renderScale(scale, text, x, y) {
    Renderer.scale(scale);
    Renderer.drawString(text, x, y);
}

// Variable control
export function distanceFormula(x1, y1, z1, x2, y2, z2) {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2) + Math.pow(z1 - z2, 2));
};

export function distance2D(x1, z1, x2, z2) {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(z1 - z2, 2));
}

export function getClosest(origin, positions) {
    let closestPosition = positions.length > 0 ? positions[0] : [0, 0, 0];
    let closestDistance = 999;
    let distance = 999;

    positions.forEach(position => {
        distance = distanceFormula(origin[1], origin[2], origin[3], position[1], position[2], position[3]);
        if (distance < closestDistance) {
            closestDistance = distance;
            closestPosition = position;
        }
    });

    return [closestPosition, closestDistance];
};

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
