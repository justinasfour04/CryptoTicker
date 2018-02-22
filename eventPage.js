"use strict"

chrome.runtime.onInstalled.addListener(onInit);
onRefresh();

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
	setPrice: async function(currency) {
		try {
			const response = await AJAX.get(["https://api.coinmarketcap.com/v1/ticker/tronix/?convert=", currency].join(""));
			const trxData = JSON.parse(response)[0];
			if (parseFloat(trxData.price_cad) >= price) {
				chrome.browserAction.setBadgeBackgroundColor({
			    	color: '#2eb82e'
				});
			} else {
				chrome.browserAction.setBadgeBackgroundColor({
			    	color: '#ff0000'
				});
			}
			price = parseFloat(trxData.price_cad);
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

function onRefresh() {
	chrome.alarms.onAlarm.addListener(loadTicker);
	chrome.alarms.create("tickerAlarm", {
		when: Date.now(),
		periodInMinutes: 5
	});
}

async function loadTicker() {
    await Tronix.setPrice('CAD');
    setTitle();
    setBadge();
}