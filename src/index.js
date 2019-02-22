//Required libraries
const scrape = require('./scrape.js');
const michelinScrape = require('./michelinScraping.js');
let fs = require('fs');
let XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;


'use strict';

const hotelJSON = scrape.getHotelsJSON();
const JSONMichelin = michelinScrape.getRestaurantsJSON();

fs.writeFileSync("RelaisEtoiles.json",JSON.stringify(findMutualChefsAndPCs(hotelJSON, JSONMichelin)));

function findMutualChefsAndPCs(ListeHotels, ListeMichelin) {
    let HotelsEtoiles = [];
    for (let i = 0; i < ListeHotels.length; i++) {
        for (let j = 0; j < ListeMichelin.length; j++) {
            if (ListeHotels[i].chef === ListeMichelin[j].chef && ListeHotels[i].postalCode === ListeMichelin[j].postalCode) {
                HotelsEtoiles.push({"hotelName": ListeHotels[i].name, "restaurantName": ListeMichelin[j].name, "postalCode": ListeHotels[i].postalCode, "chef": ListeHotels[i].chef, "url": ListeHotels[i].url, "price": ListeHotels[i].price })
            }
        }
    }
    return HotelsEtoiles;
}

console.log("Fichier écrit.");

function readJSON(path) {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', path, true);
    xhr.responseType = 'blob';
    xhr.onload = function(e) {
        if (this.status === 200) {
            let file = new File([this.response], 'temp');
            let fileReader = new FileReader();
            fileReader.addEventListener('load', function(){
                console.log(fileReader.result[0].price);
                for (let i = 0; i < 5; i++){
                    console.log("Hotel " + i + ": ");
                    console.log(fileReader.result[i].hotelName);
                    console.log("Prix:");
                    console.log(fileReader.result[i].price);
                }
            });
            fileReader.readAsText(file);
        }
    };
    xhr.send();
}

readJSON("../RelaisEtoiles.json");
