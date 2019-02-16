//Required libraries
let Promise = require('promise');
let request = require('request');
let cheerio = require('cheerio');
let fs = require('fs');

//List of promises to create
let ListPromisesIndiv = [];
let ListPromises = [];

let ListHotels = [];
let cpt = 1;

//Creating promises
function createPromise() {
    let url = 'https://www.relaischateaux.com/fr/site-map/etablissements';
    ListPromises.push(fillHotelsList(url));
    console.log("Relais et Chateaux hotels added to the list");
}

function createPromiseIndiv() {
    return new Promise(function (resolve) {
        switch (cpt) {
            case 1:
                for (let i = 0; i < Math.trunc(ListHotels.length / 2); i++) {
                    let hotelURL = ListHotels[i].url;
                    ListPromisesIndiv.push(fillHotelInfo(hotelURL, i));
                    console.log("Hotel n°" + i + " ajoute");
                }
                resolve();
                cpt++;
                break;
            case 2:
                for (let i = ListHotels.length / 2; i < Math.trunc(ListHotels.length); i++) {
                    let hotelURL = ListHotels[i].url;
                    ListPromisesIndiv.push(fillHotelInfo(hotelURL, i));
                    console.log("Hotel n°" + i + " ajoute");
                }
                resolve();
                break;
        }
    })
}

//Fetching list of hotels
function fillHotelsList(url) {
    return new Promise(function (resolve, reject) {
        request(url, function (err, res, html) {
            if (err) {
                console.log(err);
                return reject(err);
            }
            else if (res.statusCode !== 200) {
                err = new Error("Unexpected status code : " + res.statusCode);
                err.res = res;
                return reject(err);
            }
            let $ = cheerio.load(html);

            let hotelsFrance = $('h3:contains("France")').next();//Limiting research to relais containing France tag
            hotelsFrance.find('li').length;
            hotelsFrance.find('li').each(function () {
                let data = $(this);
                let url = String(data.find('a').attr("href"));
                let name = data.find('a').first().text();
                name = name.replace(/\n/g, "");
                let chefName = String(data.find('a:contains("Chef")').text().split(' - ')[1]);
                chefName = chefName.replace(/\n/g, "");
                ListHotels.push({ "name": name.trim(), "postalCode": "", "chef": chefName.trim(), "url": url, "price": "" })
            });
            resolve(ListHotels);
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
                ListHotels[index].postalCode = String(pc.split(',')[0]).trim();
            });

            $('.price').first().each(function () {
                let data = $(this);
                let price = data.text();
                ListHotels[index].price = String(price);
            });
            console.log("Code postal de l'hotel n°" + index );
            resolve(ListHotels);
        });
    });
}

//Saving the file as ListeRelais.json
function saveHotelsInJson() {
    return new Promise(function (resolve) {
        try {
            console.log("Editing JSON file");
            let jsonHotels = JSON.stringify(ListHotels);
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
let prom = ListPromises[0];
prom
    .then(createPromiseIndiv)
    .then(() => { return Promise.all(ListPromisesIndiv); })
    .then(createPromiseIndiv)
    .then(() => { return Promise.all(ListPromisesIndiv); })
    .then(saveHotelsInJson)
    .then(() => { console.log("JSON file OK") });

module.exports.getHotelsJSON = function () {
    return JSON.parse(fs.readFileSync("ListeRelais.json"));
};