// Modify number/strings
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

export function getPlayerName(player) {
    // Remove rank from player name
    let name = player;
    let nameIndex = name.indexOf(']');

    while (nameIndex != -1) {
        name = name.substring(nameIndex + 2);
        nameIndex = name.indexOf(']');
    }

    return name;
}
export function getGuildName(player) {
    let name = player;
    let rankIndex = name.indexOf('] ');
    if (rankIndex != -1)
        name = name.substring(name.indexOf('] ') + 2);
    name = name.substring(0, name.indexOf('[') - 1);

    return name;
}


// Variable checking
const StandClass = Java.type("net.minecraft.entity.item.EntityArmorStand").class;
export function get3x3Stands() {
    const x = Player.getX();
    const y = Player.getY();
    const z = Player.getZ();
    
    const stands = [...World.getChunk(x, y, z).getAllEntitiesOfType(StandClass)];
    stands.push(...World.getChunk(x + 16, y, z + 16).getAllEntitiesOfType(StandClass));
    stands.push(...World.getChunk(x + 16, y, z - 16).getAllEntitiesOfType(StandClass));
    stands.push(...World.getChunk(x - 16, y, z + 16).getAllEntitiesOfType(StandClass));
    stands.push(...World.getChunk(x - 16, y, z - 16).getAllEntitiesOfType(StandClass));
    stands.push(...World.getChunk(x + 16, y, z).getAllEntitiesOfType(StandClass));
    stands.push(...World.getChunk(x - 16, y, z).getAllEntitiesOfType(StandClass));
    stands.push(...World.getChunk(x, y, z + 16).getAllEntitiesOfType(StandClass));
    stands.push(...World.getChunk(x, y, z - 16).getAllEntitiesOfType(StandClass));

    return stands;
}

export function getClosest(origin, positions) {
    let closestPosition = positions.length > 0 ? positions[0] : [0, 0, 0];
    let closestDistance = 999;
    let distance = 999;

    positions.forEach(position => {
        distance = Math.hypot(origin[1] - position[1], origin[2] - position[2], origin[3] - position[3]);
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

export function romanToNum(s) {
    const sym = { 
        'I': 1,
        'V': 5,
        'X': 10,
        'L': 50,
        'C': 100,
        'D': 500,
        'M': 1000
    }

    let result = 0;

    for (i=0; i < s.length; i++){
        const cur = sym[s[i]];
        const next = sym[s[i+1]];

        if (cur < next){
            result += next - cur // IV -> 5 - 1 = 4
            i++
        } else {
            result += cur
        }
    }

    return result.toFixed(0);
};
