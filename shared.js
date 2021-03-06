"use strict";

chrome.runtime.onInstalled.addListener(onInit);
chrome.runtime.onStartup.addListener(onStartup);

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
	},
	clear: function() {
		chrome.storage.sync.clear();
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
		id: 1958
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
		var parsePrice = function(jsonData) {
			return parseFloat(jsonData.quotes[this.conversion.toUpperCase()].price);
		}

		try {
			const response = await AJAX.get(["https://api.coinmarketcap.com/v2/ticker/", this.selected.id, "/?convert=", this.conversion].join(""));
			const data = JSON.parse(response).data;
			this.selected.symbol = data.symbol;
			this.selected.name = data.name;
			if (parsePrice.call(this, data) >= this.price) {
				chrome.browserAction.setBadgeBackgroundColor({
			    	color: '#2eb82e'
				});
			} else {
				chrome.browserAction.setBadgeBackgroundColor({
			    	color: '#ff0000'
				});
			}
			this.price = parsePrice.call(this, data); // Ensure the Cryptocurrency context is used
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

function onStartup() {
	CryptoCurrency.setSettings();
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
					chrome.alarms.create("tickerAlarm", {
						when: Date.now(),
						periodInMinutes: parseInt(CryptoCurrency.refreshRate)
					});
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