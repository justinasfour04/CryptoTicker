"use strict";

chrome.runtime.onInstalled.addListener(onInit);

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
		});
	}
}

var Storage = {
	get: function(storedItems) {
		return new Promise((resolve, reject) => {
			chrome.storage.sync.get(storedItems, function(items) {
				resolve(items);
			});
		});
	},
	set: function(itemsToStore) {
		chrome.storage.sync.set(itemsToStore);
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
	chrome.browserAction.setIcon({
		path: '32/icon/' + CryptoCurrency.selected.symbol.toLowerCase() + ".png"
	})
}

var CryptoCurrency = {
	conversion: "CAD",
    selected: {
		id: "tronix",
		symbol: "TRX"
	},
	refreshRate: "5",
	price: 0,
	setSettings: async function() {
		const items = await Storage.get(['conversion', 'selected', 'refreshRate']);
		if (Object.keys(items).length > 0) {
			this.conversion = items.conversion;
			this.selected = items.selected;
			this.refreshRate = items.refreshRate;
		}
	},
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
	await CryptoCurrency.setSettings();
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
			Storage.set({
				'conversion': CryptoCurrency.conversion,
				'selected': CryptoCurrency.selected,
				'refreshRate': CryptoCurrency.refreshRate
			});
			loadTicker();
			sendResponse("refreshed");
		}
	});
}