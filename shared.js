"use strict";

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

function setTitle() {
	chrome.browserAction.setTitle({
		"title": ["1 ", CryptoCurrency.selected.symbol, "= ", CryptoCurrency.price.toFixed(6), " ", CryptoCurrency.conversion].join("")
	});
}

function setBadge() {
	chrome.browserAction.setBadgeText({
		text: CryptoCurrency.price.toFixed(2)
	});
}

var CryptoCurrency = {
	conversion: "CAD",
    selected: {
		id: "tronix",
		symbol: "TRX"
	},
	refreshRate: "5",
	price: 0,
	setPrice: async function() {
		try {
			const response = await AJAX.get(["https://api.coinmarketcap.com/v1/ticker/", this.selected.id, "/?convert=", this.conversion].join(""));
			const trxData = JSON.parse(response)[0];
			if (parseFloat(trxData["price_" + this.conversion.toLowerCase()]) >= this.price) {
				chrome.browserAction.setBadgeBackgroundColor({
			    	color: '#2eb82e'
				});
			} else {
				chrome.browserAction.setBadgeBackgroundColor({
			    	color: '#ff0000'
				});
			}
			this.price = parseFloat(trxData["price_" + this.conversion.toLowerCase()]);
			setTimeout(() => chrome.browserAction.setBadgeBackgroundColor({ color: '#808080' }), 3000);
		} catch (e) {
			console.error(e);
		}
	}
}

function prepareBadge() {
	chrome.browserAction.setBadgeBackgroundColor({
    	color: '#808080'
	});
	chrome.browserAction.setBadgeText({
		text: '...'
	})
}

function onInit() {
	prepareBadge();
}

async function loadTicker() {
    await CryptoCurrency.setPrice();
    setTitle();
    setBadge();
}

var setMessageListener = function() {
	chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
		console.log('Message Sent');
		if (request && request.hasOwnProperty('type')) {
			switch (request.type) {
				case "currency":
					CryptoCurrency.selected = request.data;
					break;
				case "fiat":
					CryptoCurrency.conversion = request.data;
					break;
				case "refresh":
					CryptoCurrency.refreshRate = request.data;
					break;
			}
			loadTicker();
			sendResponse("refreshed");
		}
	});
}