let Promise = require('promise');
let request = require('request');
let cheerio = require('cheerio');
let fs = require('fs');


let promiseList = [];
let indivPromisesList = [];
let hotelsList = [];
let scrapingRound = 1;

function createPromise() {
    let url = 'https://www.relaischateaux.com/fr/site-map/etablissements';
    promiseList.push(fillHotelsList(url));
    console.log("Relais et Chateaux hotels added to the list");
}

function createIndividualPromises() {
    return new Promise(function (resolve) {
        if (scrapingRound === 1) {
            for (let i = 0; i < Math.trunc(hotelsList.length / 2); i++) {
                let hotelURL = hotelsList[i].url;
                indivPromisesList.push(fillHotelInfo(/*proxyUrl + */hotelURL, i));
                console.log("Added url of " + i + "th hotel to the promises list");
            }
            resolve();
            scrapingRound++;
        }
        else if (scrapingRound === 2) {
            for (let i = hotelsList.length / 2; i < Math.trunc(hotelsList.length); i++) {
                let hotelURL = hotelsList[i].url;
                indivPromisesList.push(fillHotelInfo(/*proxyUrl + */hotelURL, i));
                console.log("Added url of " + i + "th hotel to the promises list");
            }
            resolve();
        }
    })
}

//Fetching list pf hotels
function fillHotelsList(url) {
    return new Promise(function (resolve, reject) {
        request(url, function (err, res, html) {
            if (err) {
                console.log(err);
                return reject(err);
            }
            else if (res.statusCode !== 200) { //200 means request successful
                err = new Error("Unexpected status code : " + res.statusCode);
                err.res = res;
                return reject(err);
            }
            let $ = cheerio.load(html);

            let hotelsFrance = $('h3:contains("France")').next();
            hotelsFrance.find('li').length;
            hotelsFrance.find('li').each(function () {
                let data = $(this);
                let url = String(data.find('a').attr("href"));
                let name = data.find('a').first().text();
                name = name.replace(/\n/g, "");
                let chefname = String(data.find('a:contains("Chef")').text().split(' - ')[1]);
                chefname = chefname.replace(/\n/g, "");
                hotelsList.push({ "name": name.trim(), "postalCode": "", "chef": chefname.trim(), "url": url, "price": "" })
            });
            resolve(hotelsList);
        });
    });
}

//Getting all detailed info for the JSON file
function fillHotelInfo(url, index) {
    return new Promise(function (resolve, reject) {
        request(url, function (err, res, html) {
            if (err) {
                console.error(err);
                return reject(err);
            }
            else if (res.statusCode !== 200) {
                err = new Error("Unexpected status code : " + res.statusCode);
                err.res = res;
                return reject(err);
            }

            const $ = cheerio.load(html);

            $('span[itemprop="postalCode"]').first().each(function () {
                let data = $(this);
                let pc = data.text();
                hotelsList[index].postalCode = String(pc.split(',')[0]).trim();
            });

            $('.price').first().each(function () {
                let data = $(this);
                let price = data.text();
                hotelsList[index].price = String(price);
            });
            console.log("Added postal code and price of " + index + "th hotel");
            resolve(hotelsList);
        });
    });
}

//Saving the file as ListeRelais.json
function saveHotelsInJson() {
    return new Promise(function (resolve) {
        try {
            console.log("Editing JSON file");
            let jsonHotels = JSON.stringify(hotelsList);
            fs.writeFile("ListeRelais.json", jsonHotels, function doneWriting(err) {
                if (err) { console.log(err); }
            });
        }
        catch (error) {
            console.error(error);
        }
        resolve();
    });
}


//Main()
createPromise();
let prom = promiseList[0];
prom
    .then(createIndividualPromises)
    .then(() => { return Promise.all(indivPromisesList); })
    .then(createIndividualPromises)
    .then(() => { return Promise.all(indivPromisesList); })
    .then(saveHotelsInJson)
    .then(() => { console.log("JSON file OK") });

module.exports.getHotelsJSON = function () {
    return JSON.parse(fs.readFileSync("ListeRelais.json"));
};