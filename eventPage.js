"use strict"

var price = 0;

function setTitle() {
	chrome.browserAction.setTitle({
		"title": ["1 TRX = ", price.toFixed(5), " CAD"].join("")
	})
}

var AJAX = {
	get: function(url) {
		return new Promise((resolve, reject) => {
			const req = new XMLHttpRequest();
			req.onreadystatechange = (e) => {
				if (req.readyState === 4) {
					req.status === 200 ? resolve(req.response) : reject(req.status);
				}
			};
			req.ontimeout = () => reject('timeout');
			req.open('GET', url, true);
			req.send();
		})
	}
}

function setBadge() {
	chrome.browserAction.setBadgeText({
		text: price.toFixed(2)
	})
}

var Tronix = {
	getPrice: async function(currency) {
		try {
			const response = await AJAX.get(["https://api.coinmarketcap.com/v1/ticker/tronix/?convert=", currency].join(""));
			const trxData = JSON.parse(response)[0];
			return parseFloat(trxData.price_cad);
		} catch (e) {
			console.error(e);
		}
	}
}

window.addEventListener("load", loadBackground());
var fetchInterval;
async function loadBackground() {
    chrome.browserAction.setBadgeBackgroundColor({
    	color: '#000000'
	});
	chrome.browserAction.setBadgeText({
    	text: '...'
	});


    price = await Tronix.getPrice('CAD');
    setTitle();
    setBadge();
}