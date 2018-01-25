"use strict"

function setTitle() {
	var price = Tronix.getPrice("CAD");
	chrome.browserAction.setTitle({
		"title": ["1 TRX = ", price, " CAD"].join("")
	})
}

var AJAX = {
	get: function(url) {
		return new Promise((resolve, reject) => {
			const req = new XHRHttpRequest();
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