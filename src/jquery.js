//TODO Install node-fetch
const fetch = require('node-fetch');
const cheerio = require('cheerio');

async function infoHotels() {
    let hotels = [];
    let pageCpt = 1;
    let result;
    let html;
    do {
        result = await fetch("https://www.relaischateaux.com/fr/update-destination-results", {
            "credentials": "include",
            "headers": {
                "accept": "*/*",
                "accept-language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
                "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                "x-requested-with": "XMLHttpRequest"
            },
            "referrer": "https://www.relaischateaux.com/fr/destinations/europe/france",
            "referrerPolicy": "origin-when-cross-origin",
            "body": `rc_destination_availability_type%5Barea%5D=78&rc_destination_availability_type%5Bstart%5D=&rc_destination_availability_type%5Bend%5D=&rc_destination_availability_type%5BnbRooms%5D=1&rc_destination_availability_type%5B_token%5D=r-d6abtoXfWEBy2kIVNQXxbMt18hyn5ImJy8jyHMnEg&page=${pageCpt}&submit=true&areaId=78`,
            "method": "POST",
            "mode": "cors"
        });
        html = (await result.json()).html;
        if (html !== "") {
            const $ = cheerio.load(html);
            $('.mainTitle3').each(function () {
                var href = $('a', this).attr('href');
                var name = $('span', this).text();
                hotels.push({"name": name, "link": href});
            });
        }
        pageCpt++;
    } while (html !== "");
    return hotels;
}

(async function() {
    let hotels = await infoHotels();
    console.log(hotels);
})();