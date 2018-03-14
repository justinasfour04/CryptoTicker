"use strict";

chrome.runtime.onInstalled.addListener(onInit);
onRefresh();

function onRefresh() {
	setMessageListener();
	chrome.alarms.onAlarm.addListener(loadTicker);
	chrome.alarms.create("tickerAlarm", {
		when: Date.now(),
		periodInMinutes: parseInt(CryptoCurrency.refreshRate)
	});
}