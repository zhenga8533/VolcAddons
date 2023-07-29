import axios from "../../axios";

// Gets BZ Pricing for "items"
export function getBazaar(items) {
    axios.get('https://api.slothpixel.me/api/skyblock/bazaar/' + Object.keys(items).join(",")).then(response => {
        Object.keys(items).forEach((itemID) => {
            if (items[itemID] != undefined)
                items[itemID] = [
                    response.data[itemID].sell_summary[0].pricePerUnit, 
                    response.data[itemID].buy_summary[0].pricePerUnit
                ];
        });
    });
}
