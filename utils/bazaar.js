import axios from "../../axios";

// Gets BZ Pricing for "items"
export function getBazaar(items) {
    axios.get('https://api.slothpixel.me/api/skyblock/bazaar/' + Object.keys(items).join(",")).then(response => {
        Object.keys(items).forEach((itemID) => {
            if (response.data[itemID] != undefined)
                items[itemID] = [
                    response.data[itemID].quick_status.sellPrice, 
                    response.data[itemID].quick_status.buyPrice
                ];
        });
    });
}
